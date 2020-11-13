const op = require('sequelize').Op;
module.exports = (app, allowed, isLoggedIn, m) => {
    app.get('/users/get/statuses', isLoggedIn, allowed('access_ranks',    {send: true}), (req, res) => {
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
    app.get('/users/get/statuses', isLoggedIn, allowed('access_statuses', {send: true}), (req, res) => {
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
    app.get('/users/get/users',    isLoggedIn, allowed('access_users',    {send: true}), (req, res) => {
        m.users.users.findAll({
            where:      req.query,
            include:    [m.users.ranks, m.users.statuses],
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
};