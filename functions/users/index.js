module.exports = function (fs, m, fn) {
    fn.users = {password: {}, permissions: {}, ranks: {}, statuses: {}};
    fs
    .readdirSync(__dirname)
    .filter(e => {
        return (e.indexOf(".js") !== -1 && e !=="index.js");
    })
    .forEach(file => require(`./${file}`)(m, fn));
};