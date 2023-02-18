module.exports = (fs, app, m, fn) => {
    fs
    .readdirSync(__dirname)
    .filter(e => e !== "index.js")
    .forEach(file => require(`./${file}`)(app, fn));
};