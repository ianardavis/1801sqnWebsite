const inc = {};
module.exports = (app, m) => {
    var allowed             = require(`${process.env.ROOT}/middleware/allowed.js`),
        permissions_stores  = require(`${process.env.ROOT}/middleware/permissions.js`)(m.stores.permissions),
        permissions_canteen = require(`${process.env.ROOT}/middleware/permissions.js`)(m.canteen.permissions),
        permissions_users   = require(`${process.env.ROOT}/middleware/permissions.js`)(m.users.permissions);
    require(`./notes`)(app, allowed, inc, permissions_stores,  m.stores,  'stores');
    require(`./notes`)(app, allowed, inc, permissions_canteen, m.canteen, 'canteen');
    require(`./notes`)(app, allowed, inc, permissions_users,   m.users,   'users');

    require(`./notifications`)(app, allowed, permissions_stores,  m.stores,  'stores');
    require(`./notifications`)(app, allowed, permissions_canteen, m.canteen, 'canteen');
    require(`./notifications`)(app, allowed, permissions_users,   m.users,   'users');
};