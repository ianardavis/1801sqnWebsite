module.exports = function (fs, m, fn) {
    fn.users = {password: {}, permissions: {}, ranks: {}, statuses: {}, attributes: {}};
    fn.users.attributes.slim = [
        'user_id',
        'full_name',
        'first_name',
        'surname',
        'rank_id'
    ];
    fn.users.attributes.full = [
        'user_id',
        'service_number',
        'full_name',
        'first_name',
        'surname',
        'last_login',
        'login_id',
        'reset',
        'rank_id'
    ];
    fn.users.attributes.private = ['user_id', 'password', 'salt', 'reset'];
    fs
    .readdirSync(__dirname)
    .filter(e => {
        return (e.indexOf(".js") !== -1 && e !=="index.js");
    })
    .forEach(file => require(`./${file}`)(m, fn));
};