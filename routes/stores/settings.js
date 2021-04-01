module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/settings', li, pm.get, pm.check('access_settings'),     (req, res) => res.render('stores/settings/show'));

    app.get('/get/settings',   li,  pm.check('access_settings', {send: true}), (req, res) => {
        m.settings.findAll({
            where:      req.query,
            attributes: ['setting_id','_name', '_value']
        })
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting settings: ${err.message}`});
        });
    });
    app.get('/get/setting',   li,   pm.check('access_settings', {send: true}), (req, res) => {
        m.settings.findOne({
            where:   req.query,
            include: [inc.users()]
        })
        .then(setting => {
            if (!setting) res.send({success: false, message: 'Setting not found'})
            else          res.send({success: true,  result: setting})
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting setting: ${err.message}`});
        });
    });

    app.put('/settings',      li,   pm.check('setting_edit',    {send: true}), (req, res) => {
        m.settings.update(
            {_value: req.body.setting._value},
            {where: {_name: req.body.setting._name}}
        )
        .then(result => {
            if (!result) res.send({success: true, message: 'Setting not updated'})
            else         res.send({success: true, message: 'Setting updated'});
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error updating setting: ${err.message}`});
        });
    });

    app.post('/settings',     li,   pm.check('setting_add',     {send: true}), (req, res) => {
        m.settings.create({...req.body.setting, ...{user_id: req.user.user_id}})
        .then(setting => res.send({success: true, message: 'Setting created'}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error creating setting: ${err.message}`});
        });
    });
    
    app.delete('/settings/:id', li, pm.check('setting_delete',  {send: true}), (req, res) => {
        m.settings.findOne({
            where:      {setting_id: req.params.id},
            attributes: ['setting_id']
        })
        .then(setting => {
            if (!setting) res.send({success: false, message: 'Setting not found'})
            else {
                return setting.destroy()
                .then(result => {
                    if (!result) res.send({success: false, message: 'Setting not deleted'})
                    else         res.send({success: true,  message: 'Setting deleted'})
                })
                .catch(err => res.send({success: false, message: `Error deleting setting: ${err.message}`}))
            };
        })
        .catch(err => res.send({success: false, message: `Error getting setting: ${err.message}`}));
    });
};