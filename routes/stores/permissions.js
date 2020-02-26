module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //Edit
    app.get('/stores/permissions/:id/edit', isLoggedIn, allowed('user_permissions'), (req, res) => {
        if (Number(req.params.id) === req.user.user_id) {
            req.flash('danger', 'You can not edit your own permissions');
            res.redirect('/stores/users/' + req.params.id);
        } else if (Number(req.params.id) === 1) {
            req.flash('danger', 'You can not edit the Admin user permissions');
            res.redirect('/stores/users/' + req.params.id);
        } else {
            fn.getOne(
                m.users,
                {user_id: req.params.id},
                {
                    include: [
                        m.ranks,
                        {model: m.permissions, attributes: {exclude: ['createdAt', 'updatedAt', 'user_id']}}
                    ]
                }
            )
            .then(user => {
                let attributes = [];
                for (let attribute in m.permissions.rawAttributes) {
                    if (!m.permissions.rawAttributes.hasOwnProperty(attribute)) continue;
                    let obj = m.permissions.rawAttributes[attribute];
                    if (obj.fieldName !== 'user_id' && obj.fieldName !== 'createdAt' && obj.fieldName !== 'updatedAt') {
                        attributes.push(JSON.stringify({name: obj.fieldName, parent: obj.comment}))
                    };
                };
                res.render('stores/permissions/edit', {
                    f_user:     user,
                    attributes: attributes
                });
            })
            .catch(err => fn.error(err, '/stores/users/' + req.params.id, req, res));
        };
    });

    //Put
    app.put('/stores/permissions/:id', isLoggedIn, allowed('user_permissions'), (req, res) => {
        if (Number(req.params.id) !== req.user.user_id) {
            if (Number(req.params.id) !== 1) {
                for (let [permission, value] of Object.entries(res.locals.permissions)) {
                    if (!req.body.permissions[permission]) req.body.permissions[permission] = 0;
                };
                fn.update(
                    m.permissions,
                    req.body.permissions,
                    {user_id: req.params.id}
                )
                .then(result => {
                    req.flash('success', 'Permissions saved')
                    res.redirect('/stores/users/' + req.params.id)
                })
                .catch(err => fn.error(err, '/stores/users/' + req.params.id, req, res));
            } else fn.error(new Error('You can not edit the Admin user permissions'), '/stores/users/' + req.params.id, req, res);
        } else fn.error(new Error('You can not edit your own permissions'), '/stores/users/' + req.params.id, req, res);
    });
};