const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    //Edit
    app.get('/stores/permissions/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_permissions', res, (allowed) => {
            if (allowed) {
                if (Number(req.params.id) !== req.user.user_id && Number(req.params.id) !== 1) {
                    m.users.findOne({
                        where: {user_id: req.params.id},
                        include: [m.ranks, m.permissions]
                    }).then((user) => {
                        res.render('stores/permissions/edit', {
                            user: user
                        });
                    }).catch((err) => {
                        req.flash('danger', 'Error finding user!');
                        console.log(err);
                        res.redirect('/stores/users/' + req.params.id);
                    });
                } else {
                    req.flash('danger', 'You can not edit your own or the Admin user permissions');
                    res.redirect('/stores/users/' + req.params.id);
                }
            };
        });
    });

    //Put
    app.put('/stores/permissions/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('users_permissions', res, (allowed) => {
            if (allowed) {
                if (Number(req.params.id) !== req.user.user_id && Number(req.params.id) !== 1) {
                    res.locals.permissions._options.attributes.forEach((permission) => {
                        if (!req.body.permissions[permission]) {
                            req.body.permissions[permission] = 0;
                        }
                    })
                    req.body.permissions.user_id = req.params.id
                    m.permissions.update(
                        req.body.permissions,
                        {
                            where: {user_id: req.params.id}
                        }
                    ).then((user) => {
                        req.flash('success', 'User edited!');
                        res.redirect('/stores/users/' + req.params.id)
                    }).catch((err) => {
                        req.flash('danger', 'Error editing permissions!');
                        console.log(err);
                        res.redirect('/stores/users/' + req.params.id);            
                    });
                } else {
                    req.flash('danger', 'You can not edit your own or the Admin user permissions');
                    res.redirect('/stores/users/' + req.params.id);
                }
            }
        })
    })
}