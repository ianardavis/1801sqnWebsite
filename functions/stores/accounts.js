module.exports = function (m, fn) {
    fn.accounts = {};
    fn.accounts.find = function (where) {
        return fn.find(
            m.accounts,
            where,
            [fn.inc.users.user()]
        );
    };
    fn.accounts.findAll = function (query) {
        return m.accounts.findAndCountAll({
            where:   query.where,
            include: [fn.inc.users.user()],
            ...fn.pagination(query)
        });
    };

    fn.accounts.create = function (details) {
        function checkAccountDetails() {
            return new Promise((resolve, reject) => {
                if (!details.name) {
                    reject(new Error('No account name'));

                } else if (!details.number) {
                    reject(new Error('No account #'));

                } else {
                    fn.users.find({user_id: details.user_id})
                    .then(user => resolve(details))
                    .catch(reject);

                };
            });
        };
        return new Promise((resolve, reject) => {
            checkAccountDetails()
            .then(m.accounts.create)
            .then(resolve)
            .catch(reject);
        });
    };

    fn.accounts.edit = function (account_id, details) {
        function updateAccount(account) {
            return fn.update(account, details);
        };
        return new Promise((resolve, reject) => {
            fn.accounts.find({account_id: account_id})
            .then(updateAccount)
            .then(resolve)
            .catch(reject);
        });
    };

    fn.accounts.delete = function (account_id) {
        function checkForLinkedData(account) {
            return new Promise((resolve, reject) => {
                Promise.allSettled([
                    fn.demands.find({account_id: account.account_id})
                ])
                .then(results => {
                    if (results.filter(e => e.status === 'fulfilled').length > 0) {
                        reject(new Error('Account has linked data, it cannot be destroyed'));

                    } else {
                        resolve(account);

                    };
                })
                .catch(reject);
            });
        };
        function deleteAccount(account) {
            return new Promise((resolve, reject) => {
                account.destroy()
                .then(result => {
                    if (result) {
                        resolve(account.account_id);

                    } else {
                        reject(new Error('Account not deleted'));

                    };
                })
                .catch(reject);
            });
        };
        function removeFromSupplierRecords(account_id) {
            return new Promise(resolve => {
                m.suppliers.update(
                    {account_id: null},
                    {where: {account_id: account_id}}
                )
                .then(result => resolve(true))
                .catch(err => {
                    console.error(err);
                    resolve(false)
                });
            });
        };
        return new Promise((resolve, reject) => {
            fn.accounts.find({account_id: account_id})
            .then(checkForLinkedData)
            .then(deleteAccount)
            .then(removeFromSupplierRecords)
            .then(resolve)
            .catch(reject);
        });
    };
};