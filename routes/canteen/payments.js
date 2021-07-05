module.exports = (app, m, fn) => {
    app.get('/get/payments',         fn.loggedIn(), fn.permissions.check('access_payments'), (req, res) => {
        m.payments.findAll({
            where: req.query,
            include: [
                fn.inc.canteen.sale(),
                fn.inc.users.user()
            ]
        })
        .then(payments => res.send({success: true, result: payments}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/payments_session', fn.loggedIn(), fn.permissions.check('access_payments'), (req, res) => {
        m.payments.findAll({
            include: [
                fn.inc.canteen.sale({
                    where:    req.query,
                    required: true
                }),
                fn.inc.users.user()
            ]
        })
        .then(payments => res.send({success: true, result: payments}))
        .catch(err => fn.send_error(res, err))
    });
};