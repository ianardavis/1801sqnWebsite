module.exports = (fs, app, m, fn) => {
    let inc = {};
    fs
        .readdirSync(__dirname)
        .filter(file => {
            return (file.indexOf(".js") !== -1 && !["index.js", "includes.js"].includes(file));
        })
        .forEach(file => require(`./${file}`)(app, m, inc, fn));
    app.get('/stores', fn.loggedIn(), fn.permissions.get('access_stores'), (req, res) => res.render('stores/index'));
};