const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //Index
    app.get('/canteen/items', isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getAllWhere(m.canteen_items, {item_id: {[op.not]: 0}})
        .then(items => res.render('canteen/items/index', {items: items}))
        .catch(err => res.error.redirect(err, req, res));
    });

    // New
    app.get('/canteen/items/new', isLoggedIn, allowed('canteen_supervisor'), (req, res) => res.render('canteen/items/new'));
    app.post('/canteen/items', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.create(
            m.canteen_items,
            req.body.item
        )
        .then(item => {
            req.flash('success', 'Item added');
            res.redirect('/canteen/items');
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    //Edit
    app.get('/canteen/items/:id/edit', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.getOne(
            m.canteen_items,
            {item_id: req.params.id}
        )
        .then(item => res.render('canteen/items/edit', {item: item}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.put('/canteen/items/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        fn.update(
            m.canteen_items,
            req.body.item,
            {item_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Item updated');
            res.redirect('/canteen/items/' + req.params.id);
        }).catch(err => res.error.redirect(err, req, res));
    });

    //Show
    app.get('/canteen/items/:id', isLoggedIn, allowed('access_canteen'), (req, res) => {
        fn.getOne(
            m.canteen_items,
            {item_id: req.params.id},
            {include: [
                inc.canteen_sale_lines({as: 'sales', sale: true}),
                inc.canteen_receipt_lines({as: 'receipts', receipt: true}),
                inc.canteen_writeoff_lines({as: 'writeoffs', writeoff: true})
            ]}
        )
        .then(item => {
            fn.getOne(
                m.canteen_receipts,
                {
                    _complete: 0,
                    user_id: req.user.user_id
                },
                {nullOK: true}
            )
            .then(receipt => {
                fn.getOne(
                    m.canteen_writeoffs,
                    {
                        _complete: 0,
                        user_id: req.user.user_id
                    },
                    {nullOK: true}
                )
                .then(writeoff => {
                    res.render('canteen/items/show', {
                        item:     item,
                        receipt:  receipt,
                        writeoff: writeoff
                    });
                })
                .catch(err => res.error.redirect(err, req, res));
            })
            .catch(err => res.error.redirect(err, req, res));
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    // Delete
    app.delete('/canteen/items/:id', isLoggedIn, allowed('canteen_supervisor'), (req, res) => {
        if (Number(req.params.id) !== 0) {
            fn.delete(
                'canteen_items',
                {item_id: req.params.id}
            )
            .then(result => {
                req.flash('success', 'Item deleted');
                res.redirect('/canteen/items');
            })
            .catch(err => res.error.redirect(err, req, res));
        } else {
            req.flash('danger', 'This item can not be deleted');
            res.redirect('/canteen/items');
        };
    });
};