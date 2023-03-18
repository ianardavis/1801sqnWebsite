const { scryptSync, randomBytes } = require("crypto");
module.exports = function (m, fn) {
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
    fn.users.password.encrypt = function (plainText, salt = null) {
        if (!salt) salt = randomBytes(16).toString("hex")
        let password = scryptSync(plainText, salt, 128).toString("hex");
        return {salt: salt, password: password};
    };
    fn.users.password.edit = function (user_id, password) {
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
};