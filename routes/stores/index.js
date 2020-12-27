const inc = {};
module.exports = (app, m) => {
    var allowed     = require(`${process.env.ROOT}/middleware/allowed.js`),
        permissions = require(`${process.env.ROOT}/middleware/permissions.js`)(m.stores.permissions),
        download    = require(`${process.env.ROOT}/fn/utils/download`),
        fs          = require("fs");
    require('./includes.js')(inc, m);
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        if (file === 'includes.js') {

        } else require(`./${file}`)(app, allowed, inc, permissions, m);
    });

    app.get('/stores',                   permissions, allowed('access_stores'), (req, res) => res.render('stores/index'));

    app.get('/stores/download',          permissions, allowed('file_download'), (req, res) => {
        if (req.query.file) download(req.query.file, req, res);
    });
};