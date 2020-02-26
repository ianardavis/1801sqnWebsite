const fn = {},
      mw = {},
      op = require('sequelize').Op;
module.exports = (app, m) => {
    var allowed = require(process.env.ROOT + '/config/allowed.js');
    require(process.env.ROOT + '/functions')(fn, m);
    require(process.env.ROOT + '/config/middleware')(mw, fn.getPermissions);
    require('./sales') (app, allowed, fn, mw.isLoggedIn, m);
    require('./sessions')(app, allowed, fn, mw.isLoggedIn, m);
    require('./items')   (app, allowed, fn, mw.isLoggedIn, m);

    app.get('/canteen', mw.isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getSession(req, res)
        .then(session_id => res.render('canteen/index', {session_id: session_id}));
    });
};