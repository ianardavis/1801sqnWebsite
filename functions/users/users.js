module.exports = function (m, fn) {
    const default_attributes = ['user_id', 'full_name', 'first_name', 'surname', 'status_id', 'rank_id'];
    fn.users.get = function (where, attributes = default_attributes) {
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
            .catch(reject);
        });
    };
    fn.users.get_all = function (query, status_include = fn.inc.users.status()) {
        return new Promise((resolve, reject) => {
            m.users.findAndCountAll({
                where:      query.where,
                include:    [fn.inc.users.rank(), status_include],
                attributes: default_attributes,
                ...fn.pagination(query)
            })
            .then(results => resolve(results))
            .catch(reject);
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
    fn.users.edit = function (user_id, details) {
        if (details) {
            function update_user(user) {
                return new Promise((resolve, reject) => {
                    ['user_id', 'full_name', 'salt', 'password', 'last_login', 'createdAt', 'updatedAt', 'reset'].forEach(e => {
                        if (details[e]) delete details[e];
                    });
                    fn.update(user, details)
                    .then(resolve)
                    .catch(reject);
                });
            };
            return new Promise((resolve, reject) => {
                fn.users.get(
                    {user_id: user_id},
                    ['user_id', 'login_id', 'first_name', 'surname', 'status_id', 'rank_id', 'service_number']
                )
                .then(update_user)
                .then(resolve)
                .catch(reject);
            });

        } else {
            return Promise.reject(new Error('No details submitted'));
        
        };
    };
    fn.users.toggle_reset = function (user_id) {
        return new Promise((resolve, reject) => {
            fn.users.get({user_id: user_id}, ["user_id", "reset"])
            .then(user => {
                fn.update(user, {reset: !user.reset})
                .then(result => resolve(result))
                .catch(reject);
            })
            .catch(reject);
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
                    .catch(reject);

                };
            })
            .catch(err => fn.send_error(res, err));
        });
    };
};
