module.exports = (app, fn) => {
    app.get('/movements',             fn.loggedIn(), fn.permissions.get('cash_admin'),   (req, res) => res.render('canteen/movements/index'));
    app.get('/movements/:id',         fn.loggedIn(), fn.permissions.get('cash_admin'),   (req, res) => res.render('canteen/movements/show'));
    app.get('/get/movements',         fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        fn.movements.get_all(req.query.where, fn.pagination(req.query))
        .then(results => fn.send_res('movements', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/movement',          fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        fn.movements.get(req.query.where)
        .then(movements => res.send({success: true, result: movements}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/movements_holding', fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        fn.movements.get_all(
            {
                [fn.op.or]: [
                    {holding_id_to:   req.query.where.holding_id},
                    {holding_id_from: req.query.where.holding_id}
                ]
            },
            fn.pagination(req.query)
        )
        .then(results => fn.send_res('movements', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/movements',            fn.loggedIn(), fn.permissions.check('cash_admin'), (req, res) => {
        fn.movements.create(req.body.movement, req.user.user_id)
        .then(result => res.send({success: true, message: 'Movement created'}))
        .catch(err => fn.send_error(res, err));
    });
};