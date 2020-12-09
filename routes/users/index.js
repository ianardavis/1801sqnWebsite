const inc = {},
      op = require('sequelize').Op;
module.exports = (app, m) => {
    var allowed  = require(`${process.env.ROOT}/middleware/allowed.js`),
        permissions = require(`${process.env.ROOT}/middleware/permissions.js`)(m.users.permissions);
    require('./includes')(inc, m);
    app.get('/users',              permissions, allowed('access_users',    {send: true}), (req, res) => res.render('users/index'));
    app.get('/users/get/statuses', permissions,                                           (req, res) => {
        m.users.statuses.findAll({
            where:      req.query,
            include:    [],
            attributes: null
        })
        .then(statuses => {
            res.send({
                result: true,
                statuses: statuses
            });
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/users/get/statuses', permissions, allowed('access_statuses', {send: true}), (req, res) => {
        m.users.ranks.findAll({
            where:      req.query,
            include:    [],
            attributes: null
        })
        .then(ranks => {
            res.send({
                result: true,
                ranks: ranks
            });
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/users/get/users',    permissions, allowed('access_users',    {send: true}), (req, res) => {
        m.users.users.findAll({
            where:      req.query,
            include:    [inc.ranks(), inc.statuses()],
            attributes: ['user_id', 'full_name', '_bader', '_name', '_ini', 'status_id', 'rank_id', '_login_id', '_reset', '_last_login']
        })
        .then(users => {
            res.send({
                result: true,
                users: users
            });
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/users/get/user',     permissions, allowed('access_users',    {send: true}), (req, res) => {
        m.users.users.findOne({
            where:      req.query,
            include:    [inc.ranks(), inc.statuses()],
            attributes: ['user_id', 'full_name', '_bader', '_name', '_ini', 'status_id', 'rank_id', '_login_id', '_reset', '_last_login']
        })
        .then(user => {
            if (user) res.send({result: true,  user: user})
            else      res.send({result: false, message: 'User not found'});
        })
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