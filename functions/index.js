module.exports = function (fs, m, fn) {
    fs
    .readdirSync(__dirname)
    .filter(e => {
        return e !== 'standalone' && e.indexOf(".") === -1
    })
    .forEach(folder => require(`./${folder}`)(fs, m, fn));
};