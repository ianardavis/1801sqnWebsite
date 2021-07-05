module.exports = function (fs, m, fn) {
    fn.inc = {};
    fs
    .readdirSync(__dirname)
    .filter(e => e !== "index.js")
    .forEach(file => require(`./${file}`)(m, fn));
};