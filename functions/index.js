module.exports = function (fs, m, fn) {
    fs
    .readdirSync(__dirname)
    .filter(e => e.indexOf(".") === -1)
    .forEach(folder => require(`./${folder}`)(fs, m, fn));
};