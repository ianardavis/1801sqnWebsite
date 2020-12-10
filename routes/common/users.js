const op = require('sequelize').Op;
module.exports = (app, allowed, permissions, db) => {
    app.get(`/${db}/users`,     permissions, allowed('access_users', {allow: true}), (req, res) => {
        if (req.allowed) res.render(`${db}/users/index`)
        else res.redirect(`/${db}/users/${req.user.user_id}`);
    });
    app.get(`/${db}/users/:id`, permissions, allowed('access_users', {allow: true}), (req, res) => {
        if (Number(req.params.id) === req.user.user_id || req.allowed) {
            res.render(`${db}/users/show`, {
                tab: req.query.tab || 'details'
            })
        } else res.redirect(`/${db}/users/${req.user.user_id}`);
    });
};