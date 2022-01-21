module.exports = function (m, fn) {
    fn.accounts = {};
    fn.accounts.get = function (account_id) {
        return fn.get('accounts', {account_id: account_id})
    };
};