module.exports = (app, fn) => {
    app.get('/settings',          fn.loggedIn(), fn.permissions.get('access_settings'),   (req, res) => res.render('settings/show'));

    app.get('/get/settings',      fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.findAll(req.query)
        .then(settings => res.send({success: true, result: settings}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/setting',       fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.find(req.query.where)
        .then(setting => res.send({success: true, result: setting}))
        .catch(err => fn.sendError(res, err));
    });

    app.get('/get/printers',      fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.printers.find()
        .then(printers => res.send({success: true, result: printers}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/logs',          fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.logs.find(req.query.where.type, res)
        .catch(err => fn.sendError(res, err));
    });
    
    app.put('/settings',          fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.edit(req.body.setting_id, req.body.setting)
        .then(result => res.send({success: result, message: `Setting ${(result ? '' : 'not ')}updated`}))
        .catch(err => fn.sendError(res, err));
    });
    app.post('/settings',         fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.set(req.body.setting.name, req.body.setting.value)
        .then(setting => res.send({success: true, message: 'Setting created'}))
        .catch(err => fn.sendError(res, err));
    });
    app.post('/printers',         fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.set('printer', req.body.printer)
        .then(result => res.send({success: true, message: 'Printer saved'}))
        .catch(err => fn.sendError(res, err));
    });
    app.post('/logs_flush',       fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.runCommand('pm2 flush app')
        .then(result => res.send({success: true, message: 'Logs flushed'}))
        .catch(err => fn.sendError(res, err));
    });
    app.post('/git_pull',         fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.runCommand(`git  -C ${process.env.ROOT} pull`)
        .then(result => res.send({success: true, message: 'Git pulled'}))
        .catch(err => fn.sendError(res, err));
    });
    app.post('/pm2_reload',       fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.runCommand('pm2 reload app')
        .then(result => res.send({success: true, message: 'App reloaded'}))
        .catch(err => fn.sendError(res, err));
    });
    app.post('/settings/command', fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.runCommand(req.body.command)
        .then(result => res.send({success: true, message: 'Command run successfully'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.delete('/settings',       fn.loggedIn(), fn.permissions.check('access_settings'), (req, res) => {
        fn.settings.delete(req.body.setting_id_delete)
        .then(result => res.send({success: true,  message: 'Setting deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};