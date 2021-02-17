const inc_stores = {}, inc_canteen = {}, inc_users = {};
module.exports = (app, m) => {
    var al         = require(`${process.env.ROOT}/middleware/allowed.js`),
        pm_stores  = require(`${process.env.ROOT}/middleware/permissions.js`)(m.stores.permissions, m.users.permissions),
        pm_canteen = require(`${process.env.ROOT}/middleware/permissions.js`)(m.canteen.permissions, m.users.permissions),
        pm_users   = require(`${process.env.ROOT}/middleware/permissions.js`)(m.users.permissions);
    require('../stores/includes.js')(inc_stores, m);
    require('../canteen/includes.js')(inc_canteen, m);
    require('../users/includes.js')(inc_users, m);
    require(`./notes`)(app, al, inc_stores,  pm_stores,  m.stores,  'stores');
    require(`./notes`)(app, al, inc_canteen, pm_canteen, m.canteen, 'canteen');
    require(`./notes`)(app, al, inc_users,   pm_users,   m.users,   'users');

    require(`./notifications`)(app, al, pm_stores,  m.stores,  'stores');
    require(`./notifications`)(app, al, pm_canteen, m.canteen, 'canteen');
    require(`./notifications`)(app, al, pm_users,   m.users,   'users');
    
    require(`./permissions`)(app, al, pm_stores,  m, 'stores');
    require(`./permissions`)(app, al, pm_canteen, m, 'canteen');
    require(`./permissions`)(app, al, pm_users,   m, 'users');
    
    require(`./users`)(app, al, pm_stores,  'stores');
    require(`./users`)(app, al, pm_canteen, 'canteen');
    require(`./users`)(app, al, pm_users,   'users');
};