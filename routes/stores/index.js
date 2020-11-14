const inc = {};
module.exports = (app, m) => {
    var allowed  = require(`${process.env.ROOT}/middleware/allowed.js`),
        loggedIn = require(`${process.env.ROOT}/middleware/loggedIn.js`)(m.stores.permissions),
        utils    = require(`${process.env.ROOT}/fn/utils`),
        fs       = require("fs");
    fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        if (file === 'includes.js') {
            require(`./${file}`)(inc, m);
        } else if (file === 'users.js') {
            require(`./${file}`)(app, allowed, inc, loggedIn, m);
        } else {
            require(`./${file}`)(app, allowed, inc, loggedIn, m.stores)
        };
    });

    app.get('/stores', loggedIn, (req, res) => res.render('stores/index'));

    app.get('/stores/download', loggedIn, allowed('file_download'), (req, res) => {
        if (req.query.file) utils.download(req.query.file, req, res);
    });

    app.get('/stores/get/notifications', loggedIn, allowed('access_stores'), (req, res) => {
        m.stores.notifications.findAll({
            where: {user_id: req.user.user_id}
        })
        .then(notifications => res.send({result: true, notifications: notifications}))
        .catch(err => res.error.send(err, res));
    });
};