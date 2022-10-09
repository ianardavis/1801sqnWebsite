module.exports = function (fs, m, fn) {
    fn.demands = {lines: {}};
    fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf(".js") !== -1 && file !=="index.js");
    })
    .forEach(file => require(`./${file}`)(m, fn));
};