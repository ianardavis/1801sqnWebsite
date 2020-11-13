const inc = {}, 
      op = require('sequelize').Op;
module.exports = (app, m) => {
    var allowed  = require(`${process.env.ROOT}/middleware/allowed.js`),
        loggedIn = require(`${process.env.ROOT}/middleware/loggedIn.js`)(m.canteen.permissions);
    require('./includes') (inc, m);
    require('./sales')    (app, allowed, inc, loggedIn, m.canteen);
    require('./sessions') (app, allowed, inc, loggedIn, m.canteen);
    require('./items')    (app, allowed, inc, loggedIn, m.canteen);
    require('./receipts') (app, allowed, inc, loggedIn, m.canteen);
    require('./writeoffs')(app, allowed, inc, loggedIn, m.canteen);
    app.get('/canteen', loggedIn, allowed('access_canteen'), (req, res) => res.render('canteen/index'));
};