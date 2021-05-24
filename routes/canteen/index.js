module.exports = (fs, app, m, fn) => {
    let inc = {};
    require('./includes.js')(inc, m);
    fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf(".js") !== -1 && !["index.js", "includes.js"].includes(file));
    })
    .forEach(file => require(`./${file}`)(app, m, inc, fn));

    app.get('/canteen', fn.li(), fn.permissions.get('access_canteen'), (req, res) => res.render('canteen/index'));
};