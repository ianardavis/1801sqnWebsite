const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/canteen/get/permissions',    permissions, allowed('access_permissions', {send: true}), (req, res) => {
        m.permissions.findAll({
            where: req.query,
            attributes: ['permission_id', '_permission', 'createdAt']
        })
        .then(permissions => res.send({result: true, permissions: permissions}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/canteen/permissions',       permissions, allowed('permission_add',     {send: true}), (req, res) => {
        m.permissions.findOrCreate({
            where: {
                user_id:     req.body.permission.user_id,
                _permission: req.body.permission._permission
            }
        })
        .then(([permission, created]) => {
            if (created) res.send({result: true, message: 'Permission added'})
            else         res.send({result: true, message: 'User already has permission'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/canteen/permissions/:id', permissions, allowed('permission_delete',  {send: true}), (req, res) => {
       m.permissions.destroy({where: {permission_id: req.params.id}})
       .then(result => {
           if (result) res.send({result: true,  message: 'Permission added'})
           else        res.send({result: false, message: 'Permission not added'});
       })
       .catch(err => res.error.send(err, res));
    });
};