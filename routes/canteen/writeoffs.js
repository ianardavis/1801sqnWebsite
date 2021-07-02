module.exports = (app, m, inc, fn) => {
    app.get('/writeoffs',     fn.loggedIn(), fn.permissions.get('access_writeoffs'),   (req, res) => res.render('canteen/writeoffs/index'));
    app.get('/writeoffs/:id', fn.loggedIn(), fn.permissions.get('access_writeoffs'),   (req, res) => res.render('canteen/writeoffs/show'));
    
    app.get('/get/writeoffs', fn.loggedIn(), fn.permissions.check('access_writeoffs'), (req, res) => {
        m.writeoffs.findAll({
            include: [
                inc.user(),
                inc.item()
            ],
            where: req.query
        })
        .then(writeoffs => res.send({success: true, result: writeoffs}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/writeoff',  fn.loggedIn(), fn.permissions.check('access_writeoffs'), (req, res) => {
        fn.get(
            'writeoffs',
            req.query,
            [inc.user()]
        )
        .then(writeoff => res.send({success: true, result: writeoff}))
        .catch(err => fn.send_error(res, err))
    });

    app.post('/writeoffs',    fn.loggedIn(), fn.permissions.check('writeoff_add'),     (req, res) => {
        if      (!req.body.writeoff)         fn.send_error(res, 'No body')
        else if (!req.body.writeoff.reason)  fn.send_error(res, 'No reason')
        else if (!req.body.writeoff.qty)     fn.send_error(res, 'No quantity')
        else if (!req.body.writeoff.item_id) fn.send_error(res, 'No item ID')
        else {
            fn.get(
                'canteen_items',
                {item_id: req.body.writeoff.item_id}
            )
            .then(item => {
                return item.decrement('qty', {by: req.body.writeoff.qty})
                .then(result => {
                    if (!result) fn.send_error(res, 'Stock not decremented')
                    else {
                        return m.writeoffs.create({
                            ...req.body.writeoff,
                            cost:    item.cost,
                            user_id: req.user.user_id
                        })
                        .then(writeoff => res.send({success: true, message: 'Writeoff added'}))
                        .catch(err => fn.send_error(res, err));
                    };
                })
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        };
    });
};