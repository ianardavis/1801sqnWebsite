module.exports = (app, m, inc, fn) => {
    app.get('/get/payments',         fn.loggedIn(), fn.permissions.check('access_payments'), (req, res) => {
        m.payments.findAll({
            where: req.query,
            include: [
                inc.sales({as: 'sale'}),
                inc.user()
            ]
        })
        .then(payments => res.send({success: true, result: payments}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/payments_session', fn.loggedIn(), fn.permissions.check('access_payments'), (req, res) => {
        m.payments.findAll({
            include: [
                inc.sale({
                    where:    req.query,
                    required: true
                }),
                inc.user()
            ]
        })
        .then(payments => res.send({success: true, result: payments}))
        .catch(err => fn.send_error(res, err))
    });
};