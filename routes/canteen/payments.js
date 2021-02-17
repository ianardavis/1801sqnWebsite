const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    app.get('/canteen/get/payments', pm, al('access_payments', {send: true}), (req, res) => {
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