const fn = {},
      mw = {};
module.exports = (app, m) => {
    var al = require('../../config/allowed.js');
    require("../../functions")(fn, m);
    require('../../config/middleware')(mw, fn.getPermissions);
    require('./adjusts')    (app, al, fn, mw.isLoggedIn, m);
    require('./demands')    (app, al, fn, mw.isLoggedIn, m);
    require('./files')      (app, al, fn, mw.isLoggedIn, m);
    require('./genders')    (app, al, fn, mw.isLoggedIn, m);
    require('./issues')     (app, al, fn, mw.isLoggedIn, m);
    require('./item_sizes') (app, al, fn, mw.isLoggedIn, m);
    require('./items')      (app, al, fn, mw.isLoggedIn, m);
    require('./itemSearch') (app, fn, mw.isLoggedIn,     m);
    require('./notes')      (app, al, fn, mw.isLoggedIn, m);
    require('./nsns')       (app, al, fn, mw.isLoggedIn, m);
    require('./options')    (app, al, fn, mw.isLoggedIn, m);
    require('./orders')     (app, al, fn, mw.isLoggedIn, m);
    require('./permissions')(app, al, fn, mw.isLoggedIn, m);
    require('./ranks')      (app, al, fn, mw.isLoggedIn, m);
    require('./receipts')   (app, al, fn, mw.isLoggedIn, m);
    require('./reports')    (app, al, fn, mw.isLoggedIn, m);
    require('./requests')   (app, al, fn, mw.isLoggedIn, m);
    require('./returns')    (app, al, fn, mw.isLoggedIn);
    require('./serials')    (app, al, fn, mw.isLoggedIn, m);
    require('./settings')   (app, al, fn, mw.isLoggedIn, m);
    require('./statuses')   (app, al, fn, mw.isLoggedIn, m);
    require('./stock')      (app, al, fn, mw.isLoggedIn, m);
    require('./suppliers')  (app, al, fn, mw.isLoggedIn, m);
    require('./users')      (app, al, fn, mw.isLoggedIn, m);

    app.get('/stores', mw.isLoggedIn, (req, res) => res.render('stores/index'));
};
