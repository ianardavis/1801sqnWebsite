module.exports = (app, fn) => {
    app.get('/get/payments',            fn.loggedIn, fn.permissions.check('pos_user'), (req, res) => {
        fn.payments.findAll(req.query)
        .then(results => fn.sendRes('payments', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/payments_session',    fn.loggedIn, fn.permissions.check('pos_user'), (req, res) => {
        fn.payments.findAllForSession(req.query.where, fn.pagination(req.query))
        .then(results => fn.sendRes('payments', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.delete('/get/payments_session', fn.loggedIn, fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.payments.delete(req.body.payment_id)
        .then(result => res.send({success: true, message: 'Payment deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};