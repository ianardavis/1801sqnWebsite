module.exports = (fs, app, m, pm, op, send_error) => {
    let inc = {};
    require('./includes.js')(inc, m);
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== -1) && !["index.js", "includes.js"].includes(file);
    })
    .forEach(file => require(`./${file}`)(app, m, pm, op, inc, send_error));

    app.get('/canteen',      pm.get, pm.check('access_canteen'), (req, res) => res.render('canteen/index'));

    app.get('/get/settings', pm.check('access_canteen'),     (req, res) => {
        m.settings.findOne({where: req.query})
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => send_error(res, err));
    });
};