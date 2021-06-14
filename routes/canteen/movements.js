module.exports = (app, m, inc, fn) => {
    app.get('/movements',     fn.loggedIn(), fn.permissions.get('access_movements'),   (req, res) => res.render('canteen/movements/index'));
    app.get('/movements/:id', fn.loggedIn(), fn.permissions.get('access_movements'),   (req, res) => res.render('canteen/movements/show'));
    app.get('/get/movements', fn.loggedIn(), fn.permissions.check('access_movements'), (req, res) => {
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
        .catch(err => fn.send_error(res, err));
    });
};