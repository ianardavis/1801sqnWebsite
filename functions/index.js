module.exports = function (fs, m, fn) {
    fs
    .readdirSync(__dirname)
    .filter(e => e.indexOf(".js") === -1)
    .forEach(folder => require(`./${folder}`)(m, fn));
};