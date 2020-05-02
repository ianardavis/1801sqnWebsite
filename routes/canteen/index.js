const mw = {}, inc = {}, 
      op = require('sequelize').Op;
module.exports = (app, m, fn) => {
    var allowed = require(process.env.ROOT + '/config/allowed.js');
    require('./includes') (inc, m);
    require('./functions')(fn, m);
    require(process.env.ROOT + '/config/middleware')(mw, fn.getPermissions);
    require('./sales')    (app, allowed, fn, inc, mw.isLoggedIn, m);
    require('./sessions') (app, allowed, fn, inc, mw.isLoggedIn, m);
    require('./items')    (app, allowed, fn, inc, mw.isLoggedIn, m);
    require('./receipts') (app, allowed, fn, inc, mw.isLoggedIn, m);
    require('./writeoffs')(app, allowed, fn, inc, mw.isLoggedIn, m);

    app.get('/canteen', mw.isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getSession(req, res)
        .then(session_id => res.render('canteen/index', {session_id: session_id}));
    });
};