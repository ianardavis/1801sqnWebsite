module.exports = (app, m, inc, fn) => {
    app.get('/movements',             fn.loggedIn(), fn.permissions.get('access_movements'),   (req, res) => res.render('canteen/movements/index'));
    app.get('/movements/:id',         fn.loggedIn(), fn.permissions.get('access_movements'),   (req, res) => res.render('canteen/movements/show'));
    app.get('/get/movements',         fn.loggedIn(), fn.permissions.check('access_movements'), (req, res) => {
        m.movements.findAll({
            where: req.query,
            include: [
                inc.session(),
                inc.holding({as: 'holding_to'}),
                inc.holding({as: 'holding_from'})
            ]
        })
        .then(movements => res.send({success: true, movements: movements}))
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
                inc.session(),
                inc.holding({as: 'holding_to'}),
                inc.holding({as: 'holding_from'}),
                inc.user()
            ]
        })
        .then(movements => res.send({success: true, result: movements}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/movements',            fn.loggedIn(), fn.permissions.check('holding_add'), (req, res) => {
        if      (!req.body.movement.holding_id_from) fn.send_error(res, 'No source holding submitted')
        else if (!req.body.movement.holding_id_to)   fn.send_error(res, 'No destination holding submitted')
        else if (!req.body.movement.description)     fn.send_error(res, 'No description submitted')
        else if (!req.body.movement.amount)          fn.send_error(res, 'No amount submitted')
        else if (req.body.movement.holding_id_from === req.body.movement.holding_id_to) fn.send_error(res, 'Source holding is same as destination holding')
        else {
            fn.get(
                'holdings',
                {holding_id: req.body.movement.holding_id_from}
            )
            .then(holding_from => {
                if (holding_from.cash < Number(req.body.movement.amount)) fn.send_error(res, 'Not enough cash in source holding')
                else {
                    fn.get(
                        'holdings',
                        {holding_id: req.body.movement.holding_id_to}
                    )
                    .then(holding_to => {
                        return Promise.all([
                            holding_from.decrement('cash', {by: req.body.movement.amount}),
                            holding_to  .increment('cash', {by: req.body.movement.amount})
                        ])
                        .then(result => {
                            return m.movements.create({
                                ...req.body.movement,
                                type: 'Cash',
                                user_id: req.user.user_id
                            })
                            .then(movement => res.send({success: true, message: 'Transfer created'}))
                            .catch(err => {
                                console.log(err);
                                res.send({success: true, message: 'Transfer actioned, record not created'});
                            })
                        })
                        .catch(err => fn.send_error(res, err));
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        };
    });
};