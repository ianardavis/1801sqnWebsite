module.exports = (app, fn) => {
    app.get('/sales/:id',            fn.loggedIn(), fn.permissions.get('pos_user'),   (req, res) => res.render('canteen/sales/show'));

    app.get('/get/sales',            fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.findAll(req.query)
        .then(results => fn.sendRes('sales', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/sale',             fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.find(req.query.where)
        .then(sale => res.send({success: true, result: sale}))
        .catch(err => fn.sendError(res, err))
    });
    app.get('/get/sale_current',     fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.findCurrent(req.user.user_id)
        .then(sale_id => res.send({success: true, result: sale_id}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/sale_lines',       fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.lines.findAll(req.query)
        .then(results => fn.sendRes('lines', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/sale_lines/ean/:ean', fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.lines.create(req.params.ean, req.body.line.sale_id)
        .then(result => res.send({success: true, message: 'Line saved'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.put('/sale_lines',           fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.lines.edit(req.body.line)
        .then(result => res.send({success: true, message: 'Line updated'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/sales',                fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.complete(
            req.body.sale_id,
            req.body.sale,
            req.user.user_id
        )
        .then(change => res.send({success: true, change: change}))
        .catch(err => fn.sendError(res, err));
    });
};