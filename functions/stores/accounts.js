module.exports = function (m, fn) {
    fn.accounts = {};
    fn.accounts.get = function (where) {
        return new Promise((resolve, reject) => {
            m.accounts.findOne({
                where: where,
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
    fn.accounts.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.accounts.findAndCountAll({
                where:   where,
                include: [fn.inc.users.user()],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };

    fn.accounts.create = function (account) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.users.get({user_id: account.user_id})
            ])
            .then(([user]) => {
                m.accounts.create(account)
                .then(account => resolve(account))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.accounts.edit = function (account_id, details) {
        return new Promise((resolve, reject) => {
            fn.accounts.get({account_id: account_id})
            .then(account => {
                account.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.accounts.delete = function (account_id) {
        return new Promise((resolve, reject) => {
            fn.accounts.get({account_id: account_id})
            .then(account => {
                account.destroy()
                .then(result => {
                    if (result) {
                        m.suppliers.update(
                            {account_id: null},
                            {where: {account_id: account.account_id}}
                        )
                        .then(result => resolve(true))
                        .catch(err => {
                            console.log(err);
                            resolve(false)
                        });

                    } else {
                        reject(new Error('Account not deleted'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};