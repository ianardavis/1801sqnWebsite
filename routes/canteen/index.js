const mw = {}, inc = {}, 
      op = require('sequelize').Op;
module.exports = (app, m, getPermissions) => {
    let canteen = require(process.env.ROOT + '/fn/canteen'),
        allowed = require(process.env.ROOT + '/config/allowed.js');
    require('./includes') (inc, m);
    require(process.env.ROOT + '/config/middleware')(mw, {permissions: m.permissions}, getPermissions);
    require('./sales')    (app, allowed, inc, mw.isLoggedIn, m);
    require('./sessions') (app, allowed, inc, mw.isLoggedIn, m);
    require('./items')    (app, allowed, inc, mw.isLoggedIn, m);
    require('./receipts') (app, allowed, inc, mw.isLoggedIn, m);
    require('./writeoffs')(app, allowed, inc, mw.isLoggedIn, m);

    app.get('/canteen', mw.isLoggedIn, allowed('access_canteen'), (req, res) => {
        canteen.getSession(req, res)
        .then(session_id => res.render('canteen/index', {session_id: session_id}));
    });
};