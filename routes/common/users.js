const op = require('sequelize').Op;
module.exports = (app, al, pm, db) => {
    app.get(`/${db}/users`,     pm, al('access_users', {allow: true}), (req, res) => {
        if (req.allowed) res.render(`${db}/users/index`)
        else res.redirect(`/${db}/users/${req.user.user_id}`);
    });
    app.get(`/${db}/users/:id`, pm, al('access_users', {allow: true}), (req, res) => {
        if (Number(req.params.id) === req.user.user_id || req.allowed) {
            res.render(`${db}/users/show`)
        } else res.redirect(`/${db}/users/${req.user.user_id}`);
    });
};