const { scryptSync, randomBytes } = require("crypto");
module.exports = function (m, fn) {
    fn.users = {password: {}, permissions: {}, ranks: {}, statuses: {}};
    const default_attributes = ['user_id', 'full_name', 'first_name', 'surname', 'status_id', 'rank_id'];
    fn.users.get    = function (where, attributes = default_attributes) {
        return new Promise((resolve, reject) => {
            m.users.findOne({
                where: where,
                include: [fn.inc.users.rank(), fn.inc.users.status()],
                attributes: attributes
            })
            .then(user => {
                if (user) {
                    resolve(user);

                } else {
                    reject(new Error('User not found'));
                
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.users.getAll = function (where, pagination, status_include = fn.inc.users.status()) {
        return new Promise((resolve, reject) => {
            m.users.findAndCountAll({
                where:      where,
                include:    [fn.inc.users.rank(), status_include],
                attributes: default_attributes,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    fn.users.create = function (user) {
        return new Promise((resolve, reject) => {
            if (
                (user.service_number) &&
                (user.first_name)     &&
                (user.surname)        &&
                (user.rank_id)        &&
                (user.status_id)      &&
                (user.login_id)
            ) {
                let password = fn.users.password.generate();
                m.users.findOrCreate({
                    where: {service_number: user.service_number},
                    defaults: {
                        first_name: user.first_name,
                        surname:    user.surname,
                        rank_id:    user.rank_id,
                        status_id:  user.status_id,
                        login_id:   user.login_id.toLowerCase(),
                        reset:      true,
                        ...fn.users.password.encrypt(password.plain)
                    }
                })
                .then(([user, created]) => {
                    if (!created) {
                        reject(new Error('There is already a user with this service #'));

                    } else {
                        resolve(password.readable);
                    
                    };
                })
            } else {
                reject(new Error('Not all required information has been submitted'));
            
            };
        });
    };
    fn.users.edit   = function (user_id, details) {
        return new Promise((resolve, reject) => {
            if (details) {
                fn.users.get({user_id: user_id})
                .then(user => {
                    if (user) {
                        if (!details.reset) details.reset = 0;
                        ['user_id', 'full_name', 'salt', 'password', 'last_login', 'createdAt', 'updatedAt'].forEach(e => {
                            if (details[e]) delete details[e];
                        });
                        user.update(details)
                        .then(result => {
                            if (result) {
                                resolve(result);

                            } else {
                                reject(new Error('User not updated'));

                            };
                        })
                        .catch(err => reject(err));

                    } else {
                        reject(new Error('User not found'));
                    
                    };
                })
            } else {
                reject(new Error('No details submitted'));
            
            };
        });
    };
    fn.users.delete = function (user_id, user_id_self) {
        return new Promise((resolve, reject) => {
            fn.users.get({user_id: user_id})
            .then(user => {
                if (user.user_id === user_id_self) {
                    reject(new Error('You can not delete your own account'));

                } else {
                    Promise.all([
                        m.permissions.destroy({where: {user_id: user.user_id}}),
                        user.destroy()
                    ])
                    .then(([result1, result2]) => resolve(true))
                    .catch(err => reject(err));

                };
            })
            .catch(err => fn.send_error(res, err));
        });
    };

    fn.users.password.generate = function () {
        let consenants = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'],
            vowels     = ['a','e','i','o','u','y'],
            plain      = '',
            readable   = '';
        ['C','V','C','-','C','V','C','-','C','V','C'].forEach(l => {
            let rand = Math.random(), letter = '-';
            if (l === 'C') {
                letter = consenants[Math.floor(rand*consenants.length)];
                plain += letter;
                
            } else if (l === 'V'){
                letter = vowels[Math.floor(rand*vowels.length)];
                plain += letter;
                
            };
            readable += letter.toUpperCase();
        });
        return {plain: plain, readable: readable};
    };
    fn.users.password.encrypt  = function (plainText, salt = null) {
        if (!salt) salt = randomBytes(16).toString("hex")
        let password = scryptSync(plainText, salt, 128).toString("hex");
        return {salt: salt, password: password};
    };
    fn.users.password.edit     = function (user_id, password) {
        return new Promise((resolve, reject) => {
            fn.users.get({user_id: user_id})
            .then(user => {
                if (user.password === fn.users.password.encrypt(password, user.salt).password) {
                    reject(new Error('That is the current password!'));

                } else {
                    user.update(fn.users.password.encrypt(password))
                    .then(result => resolve(true))
                    .catch(err => reject(err));

                };
            })
            .catch(err => reject(err));
        });
    };

    function permissions_allowed(user_id, allowed) {
        return new Promise((resolve, reject) => {
            fn.allowed(user_id, 'edit_own_permissions', true)
            .then(edit_own => {
                if (!allowed && !edit_own) {
                    reject(new Error('Permission denied'));

                } else {
                    resolve(true);
                
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.users.permissions.getAll = function (user_id, allowed, where, pagination) {
        return new Promise((resolve, reject) => {
            permissions_allowed(user_id, allowed)
            .then(allowed => {
                m.permissions.findAndCountAll({
                    where: where,
                    ...pagination
                })
                .then(results => resolve(results))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.users.permissions.update = function (user_id_self, user_id, allowed, submitted_permissions) {
        return new Promise((resolve, reject) => {
            permissions_allowed(user_id_self, allowed)
            .then(allowed => {
                fn.users.get({user_id: user_id})
                .then(user => {
                    m.permissions.findAll({
                        where:      {user_id: user.user_id},
                        attributes: ['permission_id', 'permission']
                    })
                    .then(permissions => {
                        let actions = [];
                        permissions.forEach(permission => {
                            if (!submitted_permissions.includes(permission.permission)) {
                                actions.push(
                                    m.permissions.destroy({where: {permission_id: permission.permission_id}})
                                );
                            };
                        });
                        submitted_permissions.forEach(permission => {
                            actions.push(
                                m.permissions.findOrCreate({
                                    where: {
                                        user_id:    user.user_id,
                                        permission: permission
                                    }
                                })
                            );
                        });
                        Promise.allSettled(actions)
                        .then(results => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.users.ranks.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.ranks.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

    fn.users.statuses.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.statuses.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err =>    reject(err));
        });
    };
};