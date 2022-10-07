module.exports = (app, m, fn) => {
    app.get('/get/payments',            fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        m.payments.findAndCountAll({
            where: req.query.where,
            include: [
                fn.inc.canteen.sale(),
                fn.inc.users.user()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('payments', res, results, req.query))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/payments_session',    fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        m.payments.findAndCountAll({
            include: [
                fn.inc.canteen.sale({
                    where:    req.query.where,
                    required: true
                }),
                fn.inc.users.user()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('payments', res, results, req.query))
        .catch(err => fn.send_error(res, err))
    });
    app.delete('/get/payments_session', fn.loggedIn(), fn.permissions.check('pos_user'), (req, res) => {
        fn.sales.payments.delete(req.body.payment_id)
        .then(result => res.send({success: true, message: 'Payment deleted'}))
        .catch(err => fn.send_error(res, err))
    });
};