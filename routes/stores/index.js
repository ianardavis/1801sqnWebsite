const fn = {},
      mw = {};
module.exports = (app, m) => {
    var al = require('../../config/allowed.js');
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    require('./users')(app, m, al);
    require('./items')(app, m, al);
    require('./item_sizes')(app, m, al);
    require('./stock')(app, m, al);
    require('./nsns')(app, m, al);
    require('./notes')(app, m, al);
    require('./suppliers')(app, m, al);
    require('./issues')(app, m, al);
    require('./permissions')(app, m, al);
    require('./itemSearch')(app, m, al);
    require('./orders')(app, m, al);
    require('./requests')(app, m, al);
    require('./adjusts')(app, m, al);
    require('./settings')(app, m, al);
    require('./sizes')(app, m, al);
    require('./ranks')(app, m, al);
    require('./statuses')(app, m, al);
    require('./genders')(app, m, al);
    require('./demands')(app, m, al);
    require('./receipts')(app, m, al);
    require('./options')(app, m, al);
    require('./files')(app, m, al);
    require('./returns')(app, m, al);

    app.get('/stores', mw.isLoggedIn, (req, res) => {
        res.render('stores/index');
    });
};
