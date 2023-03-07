module.exports = (fs, app, fn) => {
    fs
    .readdirSync(__dirname)
    .filter(e => e !== "index.js")
    .forEach(file => require(`./${file}`)(app, fn));
};