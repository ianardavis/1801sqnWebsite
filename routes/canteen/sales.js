module.exports = (app, fn) => {
    app.get('/sales/:id',            fn.loggedIn(), fn.permissions.get('pos_user'),   (req, res) => res.render('canteen/sales/show'));

    app.get('/get/sales',            fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.get_all(req.query)
        .then(results => fn.send_res('sales', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/sale',             fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.get(req.query.where)
        .then(sale => res.send({success: true, result: sale}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/sale_current',     fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.get_current(req.user.user_id)
        .then(sale_id => res.send({success: true, result: sale_id}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/sale_lines',       fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.lines.get_all(req.query)
        .then(results => fn.send_res('lines', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/sale_lines/ean/:ean', fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.lines.create(req.params.ean, req.body.line.sale_id)
        .then(result => res.send({success: true, message: 'Line saved'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/sale_lines',           fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.lines.edit(req.body.line)
        .then(result => res.send({success: true, message: 'Line updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/sales',                fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.complete(
            req.body.sale_id,
            req.body.sale,
            req.user.user_id
        )
        .then(change => res.send({success: true, change: change}))
        .catch(err => fn.send_error(res, err));
    });
};