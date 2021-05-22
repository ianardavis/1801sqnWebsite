module.exports = (fs, app, m, fn) => {
    let inc = {};
    require('./includes.js')(inc, m);
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== -1) && !["index.js", "includes.js"].includes(file);
    })
    .forEach(file => require(`./${file}`)(app, m, inc, fn));
};