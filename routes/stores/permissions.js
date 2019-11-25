const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    //Edit
    app.get('/stores/permissions/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_permissions', true, req, res, allowed => {
            if (Number(req.params.id) !== req.user.user_id && Number(req.params.id) !== 1) {
                fn.getOne(
                    m.users,
                    {user_id: req.params.id},
                    [m.ranks, {model: m.permissions, attributes: {exclude: ['createdAt', 'updatedAt', 'user_id']}}]
                    
                )
                .then(user => {
                    if (user) {
                        res.render('stores/permissions/edit', {
                            user: user
                        });
                    } else {
                        res.redirect('/stores/users/' + req.params.id);
                    };
                })
                .catch(err => {
                    fn.error(err, '/stores/users/' + req.params.id, req, res);
                });
            } else {
                req.flash('danger', 'You can not edit your own or the Admin user permissions');
                res.redirect('/stores/users/' + req.params.id);
            };
        });
    });

    //Put
    app.put('/stores/permissions/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_permissions', true, req, res, (allowed) => {
            if (Number(req.params.id) !== req.user.user_id && Number(req.params.id) !== 1) {
                res.locals.permissions._options.attributes.forEach(permission => {
                    if (!req.body.permissions[permission]) {
                        req.body.permissions[permission] = 0;
                    };
                });
                req.body.permissions.user_id = req.params.id;
                fn.update(
                    m.permissions,
                    req.body.permissions,
                    {user_id: req.params.id}
                )
                .then(result => {
                    res.redirect('/stores/users/' + req.params.id)
                })
                .catch(err => {
                    fn.error(err, '/stores/users/' + req.params.id, req, res);
                });
            } else {
                req.flash('danger', 'You can not edit your own or the Admin user permissions');
                res.redirect('/stores/users/' + req.params.id);
            };
        });
    });
};