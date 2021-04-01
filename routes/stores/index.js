module.exports = (fs, app, m, pm, op, li, send_error) => {
    let inc = {};
    require('./includes.js')(inc, m);
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== -1) && !["index.js", "includes.js"].includes(file);
    })
    .forEach(file => require(`./${file}`)(app, m, pm, op, inc, li, send_error));

    app.get('/stores', li, pm.get, pm.check('access_stores'), (req, res) => res.render('stores/index'));
};