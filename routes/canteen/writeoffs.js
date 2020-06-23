const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    app.get('/canteen/writeoffs', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getAll(
            m.canteen_writeoffs,
            [
                inc.canteen_writeoff_lines(),
                inc.users()
            ]
        )
        .then(writeoffs => res.render('canteen/writeoffs/index', {writeoffs: writeoffs}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/writeoffs/new/:reason', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getOne(
            m.canteen_writeoffs,
            {
                _complete: 0,
                user_id: req.user.user_id
            },
            {nullOK: true}
        )
        .then(writeoff => {
            if (!writeoff) {
                fn.create(
                    m.canteen_writeoffs,
                    {
                        user_id: req.user.user_id,
                        _reason: req.params.reason || 'Unspecified'
                    }
                )
                .then(new_writeoff => {
                    req.flash('success', 'Writeoff created: ' + new_writeoff.writeoff_id);
                    res.redirect('/canteen/writeoffs');
                })
                .catch(err => res.error.redirect(err, req, res));
            } else {
                req.flash('success', 'Writeoff already open: ' + writeoff.writeoff_id);
                res.redirect('/canteen/writeoffs');
            };
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/writeoffs/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getOne(
            m.canteen_writeoffs,
            {writeoff_id: req.params.id},
            {include: [inc.canteen_writeoff_lines()]}
        )
        .then(writeoff => res.render('canteen/writeoffs/show', {writeoff: writeoff}))
        .catch(err => res.error.redirect(err, req, res));
    });

    app.post('/canteen/writeoff_lines', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getOne(
            m.canteen_writeoff_lines,
            {
                writeoff_id: req.body.line.writeoff_id,
                item_id: req.body.line.item_id
            },
            {nullOK: true}
        )
        .then(line => {
            if (!line) {
                fn.create(
                    m.canteen_writeoff_lines,
                    req.body.line
                )
                .then(line => {
                    req.flash('success', 'Item added');
                    res.redirect('/canteen/items/' + req.body.line.item_id);
                })
                .catch(err => res.error.redirect(err, req, res));
            } else {
                req.flash('danger', 'Item already on writeoff');
                res.redirect('/canteen/items/' + req.body.line.item_id);
            };
        })
    });

    app.put('/canteen/writeoff_lines/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.update(
            m.canteen_writeoff_lines,
            req.body.line,
            {line_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Line updated');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/canteen/writeoffs/:id/complete', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getAllWhere(
            m.canteen_writeoff_lines,
            {writeoff_id: req.params.id},
            {include: [
                inc.canteen_items(),
                inc.canteen_writeoffs({as: 'writeoff'})
            ]}
        )
        .then(lines => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    fn.completeCanteenMovement('subtract', line, 'canteen_writeoff_lines')
                );
            });
            actions.push(
                fn.update(
                    m.canteen_writeoffs,
                    {_complete: 1},
                    {writeoff_id: req.params.id}
                )
            )
            Promise.allSettled(actions)
            .then(results => {
                req.flash('success', 'Writeoff completed');
                res.redirect('/canteen/writeoffs/' + req.params.id);
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.put('/canteen/writeoffs/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.update(
            m.canteen_writeoffs,
            req.body.writeoff,
            {writeoff_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Writeoff updated');
            res.redirect('/canteen/writeoffs/' + req.params.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    app.delete('/canteen/writeoff_lines/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.delete(
            'canteen_writeoff_lines',
            {line_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Line removed');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.delete('/canteen/writeoffs/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.delete(
            m.canteen_writeoffs,
            {writeoff_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Writeoff deleted');
            res.redirect('/canteen');
        })
        .catch(err => res.error.redirect(err, req, res));
    });
};