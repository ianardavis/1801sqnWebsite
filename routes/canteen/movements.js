module.exports = (app, m, fn) => {
    app.get('/movements',             fn.loggedIn(), fn.permissions.get('access_movements'),   (req, res) => res.render('canteen/movements/index'));
    app.get('/movements/:id',         fn.loggedIn(), fn.permissions.get('access_movements'),   (req, res) => res.render('canteen/movements/show'));
    app.get('/get/movements',         fn.loggedIn(), fn.permissions.check('access_movements'), (req, res) => {
        m.movements.findAll({
            where: req.query,
            include: [
                fn.inc.canteen.session(),
                fn.inc.canteen.holding({as: 'holding_to'}),
                fn.inc.canteen.holding({as: 'holding_from'})
            ]
        })
        .then(movements => res.send({success: true, result: movements}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/movements_holding', fn.loggedIn(), fn.permissions.check('access_movements'), (req, res) => {
        m.movements.findAll({
            where: {
                [fn.op.or]: [
                    {holding_id_to:   req.query.holding_id},
                    {holding_id_from: req.query.holding_id}
                ]
            },
            include: [
                fn.inc.canteen.session(),
                fn.inc.canteen.holding({as: 'holding_to'}),
                fn.inc.canteen.holding({as: 'holding_from'}),
                fn.inc.users.user()
            ]
        })
        .then(movements => res.send({success: true, result: movements}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/movements',            fn.loggedIn(), fn.permissions.check('holding_add'),      (req, res) => {   
        if (!req.body.movement) fn.send_error(res, 'No details')
        else {
            fn.movements.create(req.body.movement, req.user.user_id)
            .then(result => res.send({success: true, message: 'Movement created'}))
            .catch(err => fn.send_error(res, err));
        };
    });
};