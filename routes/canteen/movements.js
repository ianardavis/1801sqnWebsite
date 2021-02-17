const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    app.get('/canteen/movements',     pm, al('access_movements'),               (req, res) => res.render('canteen/movements/index'));
    app.get('/canteen/movements/:id', pm, al('access_movements'),               (req, res) => res.render('canteen/movements/show'));
    app.get('/canteen/get/movements', pm, al('access_movements', {send: true}), (req, res) => {
        m.movements.findAll({
            where: req.query,
            include: [
                inc.users({as: 'user'}),
                inc.users({as: 'user_to'}),
                inc.users({as: 'user_from'}),
                inc.users({as: 'user_confirm'}),
                inc.holdings({as: 'holding_to'}),
                inc.holdings({as: 'holding_from'})
            ]
        })
        .then(movements => res.send({success: true, movements: movements}))
        .catch(err => res.error.send(err, res));
    });
};