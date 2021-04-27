module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/settings',        li, pm.get('access_settings'),   (req, res) => res.render('stores/settings/show'));

    app.get('/get/settings',    li, pm.check('access_settings'), (req, res) => {
        m.settings.findAll({
            where:      req.query,
            attributes: ['setting_id','name', 'value']
        })
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/setting',     li, pm.check('access_settings'), (req, res) => {
        m.settings.findOne({where: req.query})
        .then(setting => {
            if (!setting) send_error(res, 'Setting not found')
            else          res.send({success: true, result: setting})
        })
        .catch(err => send_error(res, err));
    });

    app.put('/settings',        li, pm.check('setting_edit'),    (req, res) => {
        m.settings.update(
            {_value: req.body.setting._value},
            {where: {name: req.body.setting.name}}
        )
        .then(result => {
            if (!result) res.send({success: true, message: 'Setting not updated'})
            else         res.send({success: true, message: 'Setting updated'});
        })
        .catch(err => send_error(res, err));
    });

    app.post('/settings',       li, pm.check('setting_add'),     (req, res) => {
        m.settings.create({...req.body.setting, ...{user_id: req.user.user_id}})
        .then(setting => res.send({success: true, message: 'Setting created'}))
        .catch(err => send_error(res, err));
    });
    
    app.delete('/settings/:id', li, pm.check('setting_delete'),  (req, res) => {
        m.settings.findOne({
            where:      {setting_id: req.params.id},
            attributes: ['setting_id']
        })
        .then(setting => {
            if (!setting) send_error(res, 'Setting not found')
            else {
                return setting.destroy()
                .then(result => {
                    if (!result) send_error(res, 'Setting not deleted')
                    else         res.send({success: true,  message: 'Setting deleted'})
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};