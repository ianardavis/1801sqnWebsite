const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/canteen/get/payments', permissions, allowed('access_payments', {send: true}), (req, res) => {
        m.payments.findAll({
            where: req.query,
            include: [
                inc.sales({as: 'sale'}),
                inc.users()
            ]
        })
        .then(payments => res.send({success: true, result: payments}))
        .catch(err => res.error.send(err, res))
    });
};