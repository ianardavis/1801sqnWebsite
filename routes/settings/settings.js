const ptp = require('pdf-to-printer'),
      fs  = require("fs");
module.exports = (app, m, fn) => {
    app.get('/settings',        fn.loggedIn(), fn.permissions.get('access_settings'),   (req, res) => res.render('settings/show'));

    app.get('/get/settings',    fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        m.settings.findAll({
            where:      req.query.where,
            attributes: ['setting_id','name', 'value'],
            ...fn.pagination(req.query)
        })
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/setting',     fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        m.settings.findOne({where: req.query.where})
        .then(setting => {
            if (setting) {
                res.send({success: true, result: setting});

            } else {
                res.send({success: false, message: 'Setting not found'});

            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/printers',    fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        ptp.getPrinters()
        .then(printers => {
            res.send({success: true, result: printers});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/logs',        fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.get(`log ${req.query.where.type || ''}`)
        .then(settings => {
            if (settings.length === 1) {
                let readStream = fs.createReadStream(settings[0].value);
                readStream.on('open',  ()  => {readStream.pipe(res)});
                readStream.on('close', ()  => {res.end()});
                readStream.on('error', err => {
                    console.log(err);
                    res.end();
                });

            } else {
                fn.send_error(res, 'Multiple log locations');

            };
        })
        .catch(err => fn.send_error(res, err));
    });
    

    app.put('/settings',        fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.edit(req.body.setting_id, req.body.setting)
        .then(result => res.send({success: result, message: `Setting ${(result ? '' : 'not ')}updated`}))
        .catch(err => fn.send_error(res, err));
    });    

    app.post('/settings',       fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        m.settings.create({...req.body.setting, ...{user_id: req.user.user_id}})
        .then(setting => res.send({success: true, message: 'Setting created'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/printers',       fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.set('printer', req.body.printer)
        .then(result => res.send({success: true, message: 'Printer saved'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/logs_flush',     fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        try {
            const output = fn.run_cmd('pm2 flush app');
            console.log(output);
            res.send({success: true, message: 'Logs flushed'});
        } catch (err) {
            fn.send_error(res, err);
        };
    });
    app.post('/git_pull',       fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        try {
            const output = fn.run_cmd(`git  -C ${process.env.ROOT} pull`);
            console.log(output);
            res.send({success: true, message: 'Git pulled'});
        } catch (err) {
            fn.send_error(res, err);
        };
    });
    app.post('/pm2_reload',     fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        try {
            const output = fn.run_cmd('pm2 reload app');
            console.log(output);
            res.send({success: true, message: 'App reloaded'});
        } catch (err) {
            fn.send_error(res, err);
        };
    });
    
    app.delete('/settings/:id', fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        m.settings.findOne({where: {setting_id: req.params.id}})
        .then(setting => {
            if (setting) {
                setting.destroy()
                .then(result => {
                    if (!result) {
                        fn.send_error(res, 'Setting not deleted');

                    } else {
                        res.send({success: true,  message: 'Setting deleted'});

                    };
                })
                .catch(err => fn.send_error(res, err));

            } else {
                res.send({success: false, message: 'Setting not found'});

            };
        })
        .catch(err => fn.send_error(res, err));
    });

    app.put('/migrate_actions', fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        m.actions.findAll({
            where: {action: {[fn.op.or]:['DEMAND LINE | CREATED', 'Order added to demand', {[fn.op.like]: '%DEMAND LINE | INCREMENTED%'}]}},
            include: [{
                model: m.action_links, 
                as: 'links',
                where: {_table: {[fn.op.or]:['demand_lines', 'orders']}}
            }]
        })
        .then(actions => {
            let acts = [];
            actions.forEach(action => {
                const order_id       = action.links.filter(e => e._table === 'orders')      [0].id;
                const demand_line_id = action.links.filter(e => e._table === 'demand_lines')[0].id;
                acts.push(
                    m.order_demand_lines.create({
                        order_id: order_id,
                        demand_line_id: demand_line_id
                    })
                );
            });
            Promise.allSettled(acts)
            .then(results => {
                let fails = results.filter(e => e.status === 'rejected');
                console.log('fails: ', fails);
                res.send({success: true, message: `Actions ${(fails.length === 0 ? '' : 'not ')}migrated`})
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};