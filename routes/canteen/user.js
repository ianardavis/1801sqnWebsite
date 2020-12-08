const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/canteen/users',     permissions, allowed('access_users', {allow: true}), (req, res) => {
        if (req.allowed) res.render('canteen/users/index')
        else res.redirect(`/canteen/users/${req.user.user_id}`);
    });
    app.get('/canteen/users/:id', permissions, allowed('access_users', {allow: true}), (req, res) => {
        if (Number(req.params.id) === req.user.user_id || req.allowed) {
            res.render('canteen/users/show', {
                tab: req.query.tab || 'details'
            })
        } else res.redirect(`/canteen/users/${req.user.user_id}`);
    });
};