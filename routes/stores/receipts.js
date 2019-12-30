module.exports = (app, allowed, fn, isLoggedIn, m) => {
    //New Form
    app.get('/stores/receipts/new', isLoggedIn, allowed('receipts_add'), (req, res) => {
        if (req.query.s && req.query.s !== '') {
            fn.getOne(
                m.suppliers,
                {supplier_id: req.query.s}
            )
            .then(supplier => res.render('stores/receipts/new',{supplier: supplier}))
            .catch(err => fn.error(err, 'back', req, res));
        } else {
            req.flash('danger', 'No supplier specified');
            res.redirect('back');
        };
    });
    //New Logic
    app.post('/stores/receipts', isLoggedIn, allowed('receipts_add'), (req, res) => {
        if (req.body.selected) {
            var lines = []
            req.body.selected.forEach(line => lines.push(JSON.parse(line)));
            if (lines.length > 0) {
                fn.createReceipt(
                    req.body.supplier_id,
                    lines,
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
                        model: m.receipts_l,
                        as: 'lines',
                        include: [
                            {
                                model: m.stock, include: [m.locations, fn.item_sizes(false, true)]
                            }
                        ]
                    },
                    fn.users(),
                    m.suppliers
                ],
                attributes: null,
                nullOK: false}
        )
        .then(receipt => {
            fn.getNotes('receipts', req.params.id, req)
            .then(notes => {
                res.render('stores/receipts/show', {
                    receipt: receipt,
                    notes:   notes,
                    query:   {sn: Number(req.query.sn) || 2}
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
                fn.users(),
                {
                    model: m.receipts_l,
                    as: 'lines'
                }
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
    app.delete('/stores/receipts/:id', isLoggedIn, allowed('receipts_delete'), (req, res) => {
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