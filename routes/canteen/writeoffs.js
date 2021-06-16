module.exports = (app, m, inc, fn) => {
    app.get('/writeoffs',             fn.loggedIn(), fn.permissions.get('access_writeoffs'),        (req, res) => res.render('canteen/writeoffs/index'));
    app.get('/writeoffs/:id',         fn.loggedIn(), fn.permissions.get('access_writeoffs'),        (req, res) => res.render('canteen/writeoffs/show'));
    
    app.get('/get/writeoffs',         fn.loggedIn(), fn.permissions.check('access_writeoffs'),      (req, res) => {
        m.writeoffs.findAll({
            include: [inc.user()],
            where: req.query
        })
        .then(writeoffs => res.send({success: true, result: writeoffs}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/writeoff',          fn.loggedIn(), fn.permissions.check('access_writeoffs'),      (req, res) => {
        fn.get(
            'writeoffs',
            req.query,
            [inc.user()]
        )
        .then(writeoff => res.send({success: true, result: writeoff}))
        .catch(err => fn.send_error(res, err))
    });
    app.get('/get/writeoff_lines',    fn.loggedIn(), fn.permissions.check('access_writeoff_lines'), (req, res) => {
        m.writeoff_lines.findAll({
            include: [
                inc.items(),
                inc.users()
            ],
            where: req.query
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => fn.send_error(res, err))
    });

    app.post('/writeoffs',            fn.loggedIn(), fn.permissions.check('writeoff_add'),          (req, res) => {
        m.writeoffs.findOrCreate({
            where: {
                status: 1,
                _reason: req.body.writeoff._reason
            },
            defaults: {user_id: req.user.user_id}
        })
        .then(([writeoff, created]) => {
            if (created) res.send({success: true,  message: 'Writeoff created'})
            else         fn.send_error(res, 'Writeoff already open');
        })
    
    });
    app.post('/writeoff_lines/:id',   fn.loggedIn(), fn.permissions.check('writeoff_line_add'),     (req, res) => {
        mfn.get(
            'writeoffs',
            {writeoff_id: req.params.id}
        )
        .then(writeoff => {
            return m.writeoff_lines.findOrCreate({
                where: {
                    writeoff_id: writeoff.writeoff_id,
                    item_id:     req.body.line.item_id
                },
                defaults: {
                    qty:    req.body.line.qty,
                    cost:   req.body.line.cost,
                    user_id: req.user.user_id
                }
            })
            .then(([line, created]) => {
                if (created) res.send({success: true, message: 'Line added'})
                else {
                    let actions = [line.increment('_qty', {by: req.body.line.qty})];
                    if (line._cost !== req.body.line.cost) {
                        actions.push(
                            line.update({
                                cost: ((line.qty * line.cost) + (Number(req.body.line.qty) * Number(req.body.line.cost))) / (line.qty + Number(req.body.line.qty))
                            })
                        );
                    };
                    return Promise.all(actions)
                    .then(result => res.send({success: true, message: 'Line updated'}))
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    
    });

    app.put('/writeoffs/:id',         fn.loggedIn(), fn.permissions.check('writeoff_edit'),         (req, res) => {
        fn.get(
            'writeoffs',
            {writeoff_id: req.params.id}
        )
        .then(writeoff => {
            if (writeoff.status !== 1) fn.send_error(res, 'Writeoff is not open')
            else {
                let actions = [];
                actions.push(
                    new Promise((resolve, reject) => {
                        let complete_actions = [];
                        writeoff.lines.forEach(line => {
                            complete_actions.push(
                                new Promise((resolve, reject) => {
                                    fn.get(
                                        'canteen_items',
                                        {item_id: line.item_id}
                                    )
                                    .then(item => {
                                        return item.decrement(
                                            'qty',
                                            {by: line.qty}
                                        )
                                        .then(result => {
                                            return line.update({status: 2})
                                            .then(result => resolve(true))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err))
                                })
                            );
                        });
                        Promise.all(complete_actions)
                        .then(result => resolve('Lines completed'))
                        .catch(err => reject(err));
                    })
                );
                actions.push(writeoff.update({status: 2}));
                actions.push(
                    m.notes.create({
                        _id: writeoff.writeoff_id,
                        _table: 'writeoffs',
                        _note: 'Completed',
                        user_id: req.user.user_id,
                        _system: 1
                    })
                );
                return Promise.all(actions)
                .then(result => res.send({success: true, message: `Writeoff completed`}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => res.send(err, res));
    });
    
    app.delete('/writeoff_lines/:id', fn.loggedIn(), fn.permissions.check('writeoff_line_delete'),  (req, res) => {
        m.writeoff_lines.update({status: 0}, {where: {line_id: req.params.id}})
        .then(result => res.send({success: true, message: 'Line deleted'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/writeoffs/:id',      fn.loggedIn(), fn.permissions.check('writeoff_delete'),       (req, res) => {
        fn.get(
            'writeoffs',
            {writeoff_id: req.params.id}
        )
        .then(writeoff => {
            if (writeoff.status !== 1) fn.send_error(res, 'Writeoff is not open')
            else {
                let actions = [];
                actions.push(writeoff.update({status: 0}));
                actions.push(m.writeoff_lines.update({status: 0}, {where: {writeoff_id: writeoff.writeoff_id}}));
                actions.push(
                    m.notes.create({
                        _id: writeoff.writeoff_id,
                        _table: 'writeoffs',
                        _note: 'Cancelled',
                        user_id: req.user.user_id,
                        _system: 1
                    })
                );
                return Promise.all(actions)
                .then(result => res.send({success: true, message: 'Writeoff cancelled'}))
                .catch(err => fn.send_error(res, err));
            }
        })
        .catch(err => fn.send_error(res, err));
    });
};