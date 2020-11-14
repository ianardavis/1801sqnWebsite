module.exports = (app, allowed, inc, loggedIn, m) => {
    app.get('/stores/permissions/:id/edit', loggedIn, allowed('permission_edit'),                  (req, res) => {
        if (Number(req.params.id) === req.user.user_id && Number(req.params.id) !== 2) {
            res.error.redirect(new Error('You can not edit your own permissions'), req, res);
        } else if (Number(req.params.id) === 1) {
            res.error.redirect(new Error('You can not edit the Admin user permissions'), req, res);
        } else {
            m.users.findOne({
                where: {user_id: req.params.id},
                include: [
                    m.ranks,
                    {model: m.permissions, attributes: {exclude: ['createdAt', 'updatedAt', 'user_id']}}
                ]
            })
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
            .catch(err => res.error.redirect(err, req, res));
        };
    });
    
    app.get('/stores/get/permissions',      loggedIn, allowed('access_permissions', {send: true}), (req, res) => {
        m.permissions.findAll({
            where:      req.query,
            attributes: ['_permission']
        })
        .then(permissions => res.send({result: true, permissions: permissions}))
        .catch(err => res.error.send(err, res));
    });

    app.put('/stores/permissions/:id',      loggedIn, allowed('permission_edit',    {send: true}), (req, res) => {
        if (Number(req.params.id) !== req.user.user_id || Number(req.params.id) === 2) {
            if (Number(req.params.id) !== 1) {
                m.permissions.findAll({
                    where: {user_id: req.params.id},
                    attributes: ['permission_id', '_permission']
                })
                .then(permissions => {
                    let actions = [];
                    req.body.permissions.forEach(permission => {
                        if (permissions.filter(e => e._permission === permission).length === 0) {
                            actions.push(
                                m.permissions.create({
                                    user_id: req.params.id,
                                    _permission: permission
                                })
                            );
                        };
                    });
                    permissions.forEach(permission => {
                        if (req.body.permissions.filter(e => e === permission._permission).length === 0) {
                            actions.push(
                                m.permissions.destroy({where: {permission_id: permission.permission_id}})
                            );
                        };
                    });
                    if (actions.length > 0) {
                        Promise.allSettled(actions)
                        .then(result => res.send({result: true, message: 'Permissions saved'}))
                        .catch(err => res.error.send(err, res));
                    } else res.send({result: true, message: 'No changes'});
                })
                .catch(err => res.error.send(err, res));
            } else res.error.send('You can not edit the Admin user permissions', res);
        } else res.error.send('You can not edit your own permissions', res);
    });
};