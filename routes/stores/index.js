const inc = {};
module.exports = (app, m) => {
    var al = require(`${process.env.ROOT}/middleware/allowed.js`),
        pm = require(`${process.env.ROOT}/middleware/permissions.js`)(m.stores.permissions, m.users.permissions),
        // download = require('../functions/download'),
        fs = require("fs");
    require('./includes.js')(inc, m);
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        if (file === 'includes.js' || file === 'functions') {

        } else require(`./${file}`)(app, al, inc, pm, m);
    });

    app.get('/stores', pm, al('access_stores'), (req, res) => res.render('stores/index'));

    // app.get('/stores/download',          pm, al('file_download'), (req, res) => {
    //     if (req.query.file) download(req.query.file, req, res);
    // });
};