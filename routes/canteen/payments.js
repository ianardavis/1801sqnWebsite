module.exports = (app, fn) => {
    app.get('/get/payments',            fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.payments.get_all(req.query)
        .then(results => fn.send_res('payments', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/payments_session',    fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.payments.get_allForSession(req.query.where, fn.pagination(req.query))
        .then(results => fn.send_res('payments', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/get/payments_session', fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.payments.delete(req.body.payment_id)
        .then(result => res.send({success: true, message: 'Payment deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};