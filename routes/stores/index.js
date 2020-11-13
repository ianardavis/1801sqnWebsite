const inc = {};
module.exports = (app, m) => {
    var allowed  = require(`${process.env.ROOT}/middleware/allowed.js`),
        loggedIn = require(`${process.env.ROOT}/middleware/loggedIn.js`)(m.stores.permissions),
        utils = require(`${process.env.ROOT}/fn/utils`);
    require('./includes') (inc, m);
    require('./accounts')   (app, allowed, inc, loggedIn, m.stores);
    require('./adjusts')    (app, allowed, inc, loggedIn, m.stores);
    require('./demands')    (app, allowed, inc, loggedIn, m.stores);
    require('./files')      (app, allowed, inc, loggedIn, m.stores);
    require('./issues')     (app, allowed, inc, loggedIn, m.stores);
    require('./items')      (app, allowed, inc, loggedIn, m.stores);
    require('./itemSearch') (app, inc, loggedIn,     m.stores);
    require('./notes')      (app, allowed, inc, loggedIn, m.stores);
    require('./nsns')       (app, allowed, inc, loggedIn, m.stores);
    require('./orders')     (app, allowed, inc, loggedIn, m.stores);
    require('./permissions')(app, allowed, inc, loggedIn, m.stores);
    require('./receipts')   (app, allowed, inc, loggedIn, m.stores);
    require('./reports')    (app, allowed, inc, loggedIn, m.stores);
    require('./requests')   (app, allowed, inc, loggedIn, m.stores);
    require('./returns')    (app, allowed, inc, loggedIn, m.stores);
    require('./serials')    (app, allowed, inc, loggedIn, m.stores);
    require('./settings')   (app, allowed, inc, loggedIn, m.stores);
    require('./sizes')      (app, allowed, inc, loggedIn, m.stores);
    require('./stock')      (app, allowed, inc, loggedIn, m.stores);
    require('./suppliers')  (app, allowed, inc, loggedIn, m.stores);
    require('./users')      (app, allowed, inc, loggedIn, m);
    require('./async')      (app, allowed, inc, loggedIn, m);

    app.get('/stores', loggedIn, (req, res) => res.render('stores/index'));

    app.get('/stores/download', loggedIn, allowed('file_download'), (req, res) => {
        if (req.query.file) utils.download(req.query.file, req, res);
    });
};