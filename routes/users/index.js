const inc = {},
      op = require('sequelize').Op;
module.exports = (app, m) => {
    var allowed     = require(`${process.env.ROOT}/middleware/allowed.js`),
        permissions = require(`${process.env.ROOT}/middleware/permissions.js`)(m.users.permissions);
    require('./includes')(inc, m);
    require(`./users`)(app, allowed, inc, permissions, m.users);
    app.get('/users',              permissions, allowed('access_users',    {send: true}), (req, res) => res.render('users/index'));
    app.get('/users/get/statuses', permissions,                                           (req, res) => {
        m.users.statuses.findAll({where: req.query})
        .then(statuses => res.send({success: true, statuses: statuses}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/users/get/ranks',    permissions,                                           (req, res) => {
        m.users.ranks.findAll({where: req.query})
        .then(ranks => res.send({success: true, ranks: ranks}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/users/get/current',  permissions, allowed('access_users',    {send: true}), (req, res) => {
        m.users.users.findAll({
            where:      {status_id: {[op.or]: [1, 2]}},
            include:    [m.users.ranks, m.users.statuses],
            attributes: ['user_id', 'full_name', '_bader', '_name', '_ini', 'status_id', 'rank_id', '_login_id', '_reset', '_last_login']
        })
        .then(users => {
            res.send({
                result: true,
                current: users
            });
        })
        .catch(err => res.error.send(err, res));
    });
};