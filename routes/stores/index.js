const mw = {}, inc = {};
module.exports = (app, m, fn) => {
    var al = require(process.env.ROOT + '/config/allowed.js');
    require('./includes') (inc, m);
    require('./functions')(fn, m, inc);
    require(process.env.ROOT + '/config/middleware')(mw, fn.getPermissions);
    require('./accounts')   (app, al, inc, mw.isLoggedIn, m);
    require('./adjusts')    (app, al, inc, mw.isLoggedIn, m);
    require('./demands')    (app, al, inc, mw.isLoggedIn, m);
    require('./files')      (app, al, inc, mw.isLoggedIn, m);
    require('./issues')     (app, al, inc, mw.isLoggedIn, m);
    require('./sizes')      (app, al, inc, mw.isLoggedIn, m);
    require('./items')      (app, al, inc, mw.isLoggedIn, m);
    require('./itemSearch') (app, inc, mw.isLoggedIn,     m);
    require('./notes')      (app, al, inc, mw.isLoggedIn, m);
    require('./nsns')       (app, al, inc, mw.isLoggedIn, m);
    require('./orders')     (app, al, inc, mw.isLoggedIn, m);
    require('./permissions')(app, al, inc, mw.isLoggedIn, m);
    require('./receipts')   (app, al, inc, mw.isLoggedIn, m);
    require('./reports')    (app, al, inc, mw.isLoggedIn, m);
    require('./requests')   (app, al, inc, mw.isLoggedIn, m);
    require('./returns')    (app, al, inc, mw.isLoggedIn, m);
    require('./serials')    (app, al, inc, mw.isLoggedIn, m);
    require('./settings')   (app, al, inc, mw.isLoggedIn, m);
    require('./stock')      (app, al, inc, mw.isLoggedIn, m);
    require('./suppliers')  (app, al, inc, mw.isLoggedIn, m);
    require('./users')      (app, al, inc, mw.isLoggedIn, m);

    app.get('/stores', mw.isLoggedIn, (req, res) => res.render('stores/index'));

    app.get('/stores/download', mw.isLoggedIn, al('file_download'), (req, res) => {
        if (req.query.file) fn.downloadFile(req.query.file, req, res);
    });
};