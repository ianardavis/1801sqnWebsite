const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    app.get('/canteen/receipts', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getAll(
            m.canteen_receipts,
            [
                inc.canteen_receipt_lines(),
                inc.users()
            ]
        )
        .then(receipts => res.render('canteen/receipts/index', {receipts: receipts}))
        .catch(err => fn.error(err, '/canteen', req, res));
    });
    app.get('/canteen/receipts/new', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getOne(
            m.canteen_receipts,
            {
                _complete: 0,
                user_id: req.user.user_id
            },
            {nullOK: true}
        )
        .then(receipt => {
            if (!receipt) {
                fn.create(
                    m.canteen_receipts,
                    {user_id: req.user.user_id}
                )
                .then(new_receipt => {
                    req.flash('success', 'Receipt created: ' + new_receipt.receipt_id);
                    res.redirect('/canteen/receipts');
                })
                .catch(err => fn.error(err, '/canteen/receipts', req, res));
            } else {
                req.flash('success', 'Receipt already open: ' + receipt.receipt_id);
                res.redirect('/canteen/receipts');
            };
        })
        .catch(err => fn.error(err, '/canteen/receipts', req, res));
    });
    app.get('/canteen/receipts/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getOne(
            m.canteen_receipts,
            {receipt_id: req.params.id},
            {include: [inc.canteen_receipt_lines()]}
        )
        .then(receipt => res.render('canteen/receipts/show', {receipt: receipt}))
        .catch(err => fn.error(err, '/canteen', req, res));
    });

    app.post('/canteen/receipt_lines', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getOne(
            m.canteen_receipt_lines,
            {
                receipt_id: req.body.line.receipt_id,
                item_id: req.body.line.item_id
            },
            {nullOK: true}
        )
        .then(line => {
            if (!line) {
                fn.create(
                    m.canteen_receipt_lines,
                    req.body.line
                )
                .then(line => {
                    req.flash('success', 'Item added');
                    res.redirect('/canteen/items/' + req.body.line.item_id);
                })
                .catch(err => fn.error(err, '/canteen', req, res));
            } else {
                req.flash('danger', 'Item already on receipt');
                res.redirect('/canteen/items/' + req.body.line.item_id);
            };
        })
    
    });

    app.put('/canteen/receipt_lines/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.update(
            m.canteen_receipt_lines,
            req.body.line,
            {line_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Line updated');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => fn.error(err, '/canteen', req, res));
    });
    app.get('/canteen/receipts/:id/complete', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getAllWhere(
            m.canteen_receipt_lines,
            {receipt_id: req.params.id},
            {include: [
                inc.canteen_items(),
                inc.canteen_receipts({as: 'receipt'})
            ]}
        )
        .then(lines => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    fn.completeCanteenMovement('add', line, 'canteen_receipt_lines')
                );
            });
            actions.push(
                fn.update(
                    m.canteen_receipts,
                    {_complete: 1},
                    {receipt_id: req.params.id}
                )
            )
            Promise.allSettled(actions)
            .then(results => {
                req.flash('success', 'Receipt completed');
                res.redirect('/canteen/receipts/' + req.params.id);
            })
            .catch(err => fn.error(err, '/canteen/receipts', req, res));
        })
        .catch(err => fn.error(err, '/canteen/receipts', req, res));
    });
    app.put('/canteen/receipts/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.update(
            m.canteen_receipts,
            req.body.receipt,
            {receipt_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Receipt updated');
            res.redirect('/canteen/receipts/' + req.params.id);
        })
        .catch(err => fn.error(err, '/canteen', req, res));
    });

    app.delete('/canteen/receipt_lines/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.delete(
            'canteen_receipt_lines',
            {line_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Line removed');
            res.redirect('/canteen/' + req.query.page + '/' + req.query.id);
        })
        .catch(err => fn.error(err, '/canteen', req, res));
    });
    app.delete('/canteen/receipts/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.delete(
            m.canteen_receipts,
            {receipt_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Receipt deleted');
            res.redirect('/canteen');
        })
        .catch(err => fn.error(err, '/canteen', req, res));
    });
};