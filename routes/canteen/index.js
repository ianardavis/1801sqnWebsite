module.exports = (fs, app, fn) => {
    fs
    .readdirSync(__dirname)
    .filter(e => e !== "index.js")
    .forEach(file => require(`./${file}`)(app, fn));

    app.get('/canteen', fn.loggedIn(), fn.permissions.get('access_canteen'), (req, res) => res.render('canteen/index'));
};