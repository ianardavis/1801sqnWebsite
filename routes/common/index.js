const inc_stores = {}, inc_canteen = {}, inc_users = {};
module.exports = (app, m) => {
    var allowed             = require(`${process.env.ROOT}/middleware/allowed.js`),
        permissions_stores  = require(`${process.env.ROOT}/middleware/permissions.js`)(m.stores.permissions),
        permissions_canteen = require(`${process.env.ROOT}/middleware/permissions.js`)(m.canteen.permissions),
        permissions_users   = require(`${process.env.ROOT}/middleware/permissions.js`)(m.users.permissions);
    require('../stores/includes.js')(inc_stores, m);
    require('../canteen/includes.js')(inc_canteen, m);
    require('../users/includes.js')(inc_users, m);
    require(`./notes`)(app, allowed, inc_stores,  permissions_stores,  m.stores,  'stores');
    require(`./notes`)(app, allowed, inc_canteen, permissions_canteen, m.canteen, 'canteen');
    require(`./notes`)(app, allowed, inc_users,   permissions_users,   m.users,   'users');

    require(`./notifications`)(app, allowed, permissions_stores,  m.stores,  'stores');
    require(`./notifications`)(app, allowed, permissions_canteen, m.canteen, 'canteen');
    require(`./notifications`)(app, allowed, permissions_users,   m.users,   'users');
    
    require(`./permissions`)(app, allowed, permissions_stores,  m.stores,  'stores');
    require(`./permissions`)(app, allowed, permissions_canteen, m.canteen, 'canteen');
    require(`./permissions`)(app, allowed, permissions_users,   m.users,   'users');
    
    require(`./users`)(app, allowed, permissions_stores,  'stores');
    require(`./users`)(app, allowed, permissions_canteen, 'canteen');
    require(`./users`)(app, allowed, permissions_users,   'users');
};