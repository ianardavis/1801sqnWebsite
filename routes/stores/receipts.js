module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //New Form
    app.get('/stores/receipts/new', isLoggedIn, allowed('receipt_add'), (req, res) => {
        if (req.query.supplier_id && req.query.supplier_id !== '') {
            fn.getOne(
                m.suppliers,
                {supplier_id: req.query.supplier_id}
            )
            .then(supplier => res.render('stores/receipts/new', {supplier: supplier}))
            .catch(err => fn.error(err, 'back', req, res));
        } else {
            req.flash('danger', 'No supplier specified');
            res.redirect('back');
        };
    });
    //New Logic
    app.post('/stores/receipts', isLoggedIn, allowed('receipt_add'), (req, res) => {
        if (req.body.selected) {
            if (req.body.selected.length > 0) {
                fn.createReceipt(
                    req.body.supplier_id,
                    req.body.selected,
                    req.user.user_id
                )
                .then(result => res.redirect('/stores/receipts/' + result))
                .catch(err => fn.error(err, '/stores/receipts', req, res));
            };
        } else {
            req.flash('info', 'No items selected!');
            res.redirect('/stores');
        };
    });

    //Show
    app.get('/stores/receipts/:id', isLoggedIn, allowed('access_receipts'), (req, res) => {
        fn.getOne(
            m.receipts,
            {receipt_id: req.params.id},
            {
                include: [
                    {
                        model: m.receipt_lines,
                        as: 'lines',
                        include: [inc.stock({size: true})]
                    },
                    inc.users(),
                    m.suppliers
                ]
            }
        )
        .then(receipt => {
            fn.getNotes('receipts', req.params.id, req)
            .then(notes => {
                res.render('stores/receipts/show', {
                    receipt: receipt,
                    notes:   notes,
                    query:   {system: Number(req.query.system) || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/receipts', req, res));
    });
    
    //Index
    app.get('/stores/receipts', isLoggedIn, allowed('access_receipts'), (req, res) => {
        fn.getAll(
            m.receipts,
            [
                m.suppliers,
                inc.users(),
                inc.receipt_lines()
            ]
        )
        .then(receipts => {
            res.render('stores/receipts/index',{
                receipts: receipts,
                query:    {cr: Number(req.query.cr) || 2}
            });
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });
    
    // Delete
    app.delete('/stores/receipts/:id', isLoggedIn, allowed('receipt_delete'), (req, res) => {
        fn.delete(
            'receipts',
            {receipt_id: req.params.id},
            {hasLines: true}
        )
        .then(result => {
            req.flash(result.success, result.message);
            res.redirect('/stores/receipts');
        })
        .catch(err => fn.error(err, '/stores/receipts', req, res));
    });
};