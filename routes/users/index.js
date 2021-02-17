const inc = {},
      op = require('sequelize').Op;
module.exports = (app, m) => {
    var allowed     = require(`${process.env.ROOT}/middleware/allowed.js`),
        permissions = require(`${process.env.ROOT}/middleware/permissions.js`)(m.users.permissions);
    require('./includes')(inc, m);
    require(`./users`)(app, allowed, inc, permissions, m.users);
    
    app.get('/users/get/statuses', permissions,                                           (req, res) => {
        m.users.statuses.findAll({where: req.query})
        .then(statuses => res.send({success: true,  result: statuses}))
        .catch(err =>     res.send({success: false, message: `Error getting statuses: ${err.message}`}));
    });
    app.get('/users/get/ranks',    permissions,                                           (req, res) => {
        m.users.ranks.findAll({where: req.query})
        .then(ranks => res.send({success: true,  result: ranks}))
        .catch(err =>  res.send({success: false, message: `Error getting ranks: ${err.message}`}));
    });
};