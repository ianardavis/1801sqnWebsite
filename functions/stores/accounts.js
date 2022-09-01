module.exports = function (m, fn) {
    fn.accounts = {};
    fn.accounts.get = function (account_id) {
        return new Promise((resolve, reject) => {
            m.accounts.findOne({
                where: {account_id: account_id},
                include: [fn.inc.users.user()]
            })
            .then(account => {
                if (account) {
                    resolve(account);
                } else {
                    reject(new Error('Account not found'));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.accounts.edit = function (account_id, details) {
        return new Promise((resolve, reject) => {
            fn.accounts.get(account_id)
            .then(account => {
                account.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};