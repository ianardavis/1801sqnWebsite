module.exports = (fs, app, fn) => {
    fs
    .readdirSync(__dirname)
    .filter(e => e !== "index.js")
    .forEach(file => require(`./${file}`)(app, fn));
    
    app.get('/stores', fn.loggedIn(), fn.permissions.get('access_stores'), (req, res) => res.render('stores/index'));
};