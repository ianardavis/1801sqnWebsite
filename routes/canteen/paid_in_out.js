module.exports = (app, fn) => {
    app.get('/paid_in_outs',        fn.loggedIn(), fn.permissions.get('pay_in_out'),   (req, res) => res.render('canteen/paid_in_outs/index'));
    app.get('/paid_in_outs/:id',    fn.loggedIn(), fn.permissions.get('pay_in_out'),   (req, res) => res.render('canteen/paid_in_outs/show'));

    app.get('/get/paid_in_out',     fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        fn.paid_in_outs.get(req.query.where)
        .then(paid_in => res.send({success: true, result: paid_in}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/paid_in_outs',    fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        fn.paid_in_outs.getAll(req.query.where, fn.pagination(req.query))
        .then(results => fn.send_res('paid_ins', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/paid_in_outs/:id',    fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        fn.paid_in_outs.complete(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Pay Out Completed'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/paid_in_outs',       fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        fn.paid_in_outs.create(req.body.paid_in_out, req.user.user_id)
        .then(result => res.send({success: true, message: 'Paid In/Out Added'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/paid_in_outs/:id', fn.loggedIn(), fn.permissions.check('pay_in_out'), (req, res) => {
        fn.paid_in_outs.cancel(req.params.id, req.user.user_id)
        .then(result => res.send({success: true, message: 'Pay Out Cancelled'}))
        .catch(err => fn.send_error(res, err));
    });
};