module.exports = (fs, app, m, fn) => {
    let inc = {};
    require('./includes.js')(m, inc);
    fs
        .readdirSync(__dirname)
        .filter(function(file) {
            return (file.indexOf(".") !== -1) && !["index.js", "includes.js"].includes(file);
        })
        .forEach(file => require(`./${file}`)(app, m, inc, fn));
    app.get('/stores', fn.li(), fn.permissions.get('access_stores'), (req, res) => res.render('stores/index'));
};