const ptp = require('pdf-to-printer'),
      fs  = require("fs");
module.exports = (app, m, inc, fn) => {
    app.get('/settings',        fn.li(), fn.permissions.get('access_settings'),   (req, res) => res.render('settings/show'));

    app.get('/get/settings',    fn.li(), fn.permissions.check('access_settings'), (req, res) => {
        m.settings.findAll({
            where:      req.query,
            attributes: ['setting_id','name', 'value']
        })
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/setting',     fn.li(), fn.permissions.check('access_settings'), (req, res) => {
        m.settings.findOne({where: req.query})
        .then(setting => {
            if (!setting) fn.send_error(res, 'Setting not found')
            else          res.send({success: true, result: setting})
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/printers',    fn.li(), fn.permissions.check('access_settings'), (req, res) => {
        ptp.getPrinters()
        .then(printers => {
            res.send({success: true, result: printers});
        })
        .catch(err => fn.send_error(res, err));
    });
    // app.get('/get/logs',        fn.li(), fn.permissions.check('access_settings'), (req, res) => {
    //     fn.settings.get(`log ${req.query.type || ''}`)
    //     .then(settings => {
    //         if (settings.length === 1) {
    //             fs.readFile(settings[0].value, 'utf8', (err, data) => {
    //                 if (err) fn.send_error(res, err)
    //                 else res.send({success: true, result: data});
    //             });
    //         } else fn.send_error(res, 'Multiple log locations');
    //     })
    //     .catch(err => fn.send_error(res, err));
    // });
    app.get('/get/logs',        fn.li(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.get(`log ${req.query.type || ''}`)
        .then(settings => {
            if (settings.length === 1) {
                let readStream = fs.createReadStream(settings[0].value);
                readStream.on('open',  ()  => {readStream.pipe(res)});
                readStream.on('close', ()  => {res.end()});
                readStream.on('error', err => {res.end(err)});
            } else fn.send_error(res, 'Multiple log locations');
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/settings',        fn.li(), fn.permissions.check('setting_edit'),    (req, res) => {
        m.settings.findOne({where: {setting_id: req.body.setting_id}})
        .then(setting => {
            if (!setting) fn.send_error(res, 'Setting not found')
            else {
                return setting.update(req.body.setting)
                .then(result => {
                    if (!result) res.send({success: true, message: 'Setting not updated'})
                    else         res.send({success: true, message: 'Setting updated'});
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/settings',       fn.li(), fn.permissions.check('setting_add'),     (req, res) => {
        m.settings.create({...req.body.setting, ...{user_id: req.user.user_id}})
        .then(setting => res.send({success: true, message: 'Setting created'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/printers',       fn.li(), fn.permissions.check('setting_edit'),    (req, res) => {
        fn.settings.set('printer', req.body.printer)
        .then(result => res.send({success: true, message: 'Printer saved'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/settings/:id', fn.li(), fn.permissions.check('setting_delete'),  (req, res) => {
        m.settings.findOne({
            where:      {setting_id: req.params.id},
            attributes: ['setting_id']
        })
        .then(setting => {
            if (!setting) fn.send_error(res, 'Setting not found')
            else {
                return setting.destroy()
                .then(result => {
                    if (!result) fn.send_error(res, 'Setting not deleted')
                    else         res.send({success: true,  message: 'Setting deleted'})
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};