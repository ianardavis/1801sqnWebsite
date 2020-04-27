module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //EDIT
    app.get('/stores/permissions/:id/edit', isLoggedIn, allowed('permission_edit'), (req, res) => {
        if (Number(req.params.id) === req.user.user_id && Number(req.params.id) !== 2) {
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
    //ASYNC GET
    app.get('/stores/getpermissions/:id', isLoggedIn, allowed('access_permissions', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.permissions,
            {user_id: req.params.id}
        )
        .then(permissions => res.send({result: true, permissions: permissions}))
        .catch(err => fn.send_error(err.message, res));
    });

    //PUT
    app.put('/stores/permissions/:id', isLoggedIn, allowed('permission_edit', {send: true}), (req, res) => {
        if (Number(req.params.id) !== req.user.user_id || Number(req.params.id) === 2) {
            if (Number(req.params.id) !== 1) {
                fn.getAllWhere(
                    m.permissions,
                    {user_id: req.params.id},
                    {attributes: ['permission_id', '_permission']}
                )
                .then(permissions => {
                    let actions = [];
                    req.body.permissions.forEach(permission => {
                        if (permissions.filter(e => e._permission === permission).length === 0) {
                            actions.push(
                                fn.create(
                                    m.permissions,
                                    {
                                        user_id: req.params.id,
                                        _permission: permission
                                    }
                                )
                            );
                        };
                    });
                    permissions.forEach(permission => {
                        if (req.body.permissions.filter(e => e === permission._permission).length === 0) {
                            actions.push(
                                fn.delete(
                                    'permissions',
                                    {permission_id: permission.permission_id}
                                )
                            );
                        };
                    });
                    if (actions.length > 0) {
                        Promise.allSettled(actions)
                        .then(result => res.send({result: true, message: 'Permissions saved'}))
                        .catch(err => fn.send_error(err.message, res));
                    } else res.send({result: true, message: 'No changes'});
                })
                .catch(err => fn.send_error(err.message, res));
            } else fn.send_error('You can not edit the Admin user permissions', res);
        } else fn.send_error('You can not edit your own permissions', res);
    });
};