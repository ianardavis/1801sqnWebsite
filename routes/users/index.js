const inc = {};
module.exports = (app, m) => {
    var allowed  = require(`${process.env.ROOT}/middleware/allowed.js`),
        loggedIn = require(`${process.env.ROOT}/middleware/loggedIn.js`)(m.users.permissions);
    require('./includes')(inc, m);

    app.get('/users',              loggedIn, allowed('access_users',    {send: true}), (req, res) => res.render('users/index'));
    app.get('/users/get/statuses', loggedIn, allowed('access_ranks',    {send: true}), (req, res) => {
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
    app.get('/users/get/statuses', loggedIn, allowed('access_statuses', {send: true}), (req, res) => {
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
    app.get('/users/get/users',    loggedIn, allowed('access_users',    {send: true}), (req, res) => {
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