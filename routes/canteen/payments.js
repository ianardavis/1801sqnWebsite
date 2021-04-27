module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/payments', li, pm.check('access_payments'), (req, res) => {
        m.payments.findAll({
            where: req.query,
            include: [
                inc.sales({as: 'sale'}),
                inc.users()
            ]
        })
        .then(payments => res.send({success: true, result: payments}))
        .catch(err => send_error(res, err))
    });
};