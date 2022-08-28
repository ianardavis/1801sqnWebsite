const { scryptSync, randomBytes } = require("crypto");
module.exports = function (m, fn) {
    fn.users = {password: {}};
    fn.users.get = function (user_id) {
        return new Promise((resolve, reject) => {
            m.users.findOne({
                where: {user_id: user_id},
                include: [m.ranks, m.statuses]
            })
            .then(user => {
                if (user) resolve(user)
                else reject(new Error('User not found'))
            })
            .catch(err => reject(err));
        });
    }
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
                    if (!created) reject(new Error('There is already a user with this service #'))
                    else resolve(password.readable);
                })
            } else reject(new Error('Not all required information has been submitted'));
        });
    };
    fn.users.edit   = function (user_id, details) {
        return new Promise((resolve, reject) => {
            if (details) {
                fn.users.get(user_id)
                .then(user => {
                    if (user) {
                        if (!details.reset) details.reset = 0;
                        ['user_id', 'full_name', 'salt', 'password', 'last_login', 'createdAt', 'updatedAt'].forEach(e => {
                            if (details[e]) delete details[e];
                        });
                        user.update(details)
                        .then(result => resolve(result))
                        .catch(err => reject(err));
                    } else reject(new Error('User not found'));
                })
            } else reject(new Error('No details submitted'));
        });
    }
    fn.users.delete = function (user_id) {
        return new Promise((resolve, reject) => {
            fn.users.get(user_id)
            .then(user => {
                if (user.user_id === req.user.user_id) reject(new Error('You can not delete your own account'))
                else {
                    let actions = [];
                    actions.push(m.permissions.destroy({where: {user_id: user.user_id}}));
                    actions.push(user.destroy());
                    Promise.all(actions)
                    .then(result => resolve(true))
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
            fn.users.get(user_id)
            .then(user => {
                if (user.password === fn.users.password.encrypt(password, user.salt).password) reject(new Error('That is the current password!'))
                else {
                    fn.update(user, fn.users.password.encrypt(password))
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};