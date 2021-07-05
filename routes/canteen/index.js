module.exports = (fs, app, m, fn) => {
    fs
    .readdirSync(__dirname)
    .filter(e => e !== "index.js")
    .forEach(file => require(`./${file}`)(app, m, fn));

    app.get('/canteen', fn.loggedIn(), fn.permissions.get('access_canteen'), (req, res) => res.render('canteen/index'));
};