const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    app.get('/stores/get/users', pm, al('access_users', {allow: true, send: true}), (req, res) => {
        if (!req.allowed) req.query.user_id = req.user.user_id;
        m.users.users.findAll({
            where: req.query,
            include: [inc.ranks()]
        })
        .then(users => res.send({success: true, result: users}))
        .catch(err => res.error.send(err, res));
    });
};