module.exports = function (m, fn) {
    fn.accounts = {};
    fn.accounts.get = function (where) {
        return fn.get(
            m.accounts,
            where,
            [fn.inc.users.user()]
        )
    };
    fn.accounts.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.accounts.findAndCountAll({
                where:   where,
                include: [fn.inc.users.user()],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };

    fn.accounts.create = function (details) {
        function check() {
            return new Promise((resolve, reject) => {
                if (!details.name) {
                    reject(new Error('No account name'));

                } else if (!details.number) {
                    reject(new Error('No account #'));

                } else {
                    fn.users.get({user_id: details.user_id})
                    .then(user => resolve(details))
                    .catch(reject);

                };
            });
        };
        return new Promise((resolve, reject) => {
            check()
            .then(m.accounts.create)
            .then(new_account => resolve(new_account))
            .catch(reject);
        });
    };

    fn.accounts.edit = function (account_id, details) {
        function update_account(account) {
            return fn.update(account, details);
        };
        return new Promise((resolve, reject) => {
            fn.accounts.get({account_id: account_id})
            .then(update_account)
            .then(result => resolve(true))
            .catch(reject);
        });
    };

    fn.accounts.delete = function (account_id) {
        function check_for_linked_data(account) {
            return new Promise((resolve, reject) => {
                Promise.allSettled([
                    fn.suppliers.get({account_id: account.account_id})
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
        function delete_account(account) {
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
        function remove_from_supplier_records(account_id) {
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
            fn.accounts.get({account_id: account_id})
            .then(check_for_linked_data)
            .then(delete_account)
            .then(remove_from_supplier_records)
            .then(then => resolve(true))
            .catch(reject);
        });
    };
};