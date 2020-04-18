module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/receipts', isLoggedIn, allowed('access_receipts'), (req, res) => {
        fn.getAll(m.suppliers)
        .then(suppliers => res.render('stores/receipts/index', {suppliers: suppliers}))
        .catch(err => fn.error(err, '/stores', req, res));
    });
    //NEW
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
    //SHOW
    app.get('/stores/receipts/:id', isLoggedIn, allowed('access_receipts'), (req, res) => {
        fn.getOne(
            m.receipts,
            {receipt_id: req.params.id},
            {include: [
                inc.users(),
                inc.suppliers({as: 'supplier'})
        ]})
        .then(receipt => {
            res.render('stores/receipts/show', {
                receipt: receipt,
                notes:   {table: 'receipts', id: receipt.receipt_id},
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => fn.error(err, '/stores/receipts', req, res));
    });
    //ASYNC GET
    app.get('/stores/getreceipts', isLoggedIn, allowed('access_receipts', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.receipts,
            req.query,
            {include: [
                inc.suppliers({as: 'supplier'}),
                inc.receipt_lines(),
                inc.users()
        ]})
        .then(receipts => res.send({result: true, receipts: receipts}))
        .catch(err => fn.send_error(err.message, res));
    });
    app.get('/stores/getreceiptlines', isLoggedIn, allowed('access_receipt_lines', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.receipt_lines,
            req.query,
            {include: [
                inc.receipts(),
                inc.stock({as: 'stock', size: true})
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err.message, res));
    });
    app.get('/stores/getreceiptlinesbysize', isLoggedIn, allowed('access_receipt_lines', {send: true}), (req, res) => {
        fn.getAll(
            m.receipt_lines,
            [
                inc.receipts(),
                inc.users(),
                inc.stock({
                    as: 'stock',
                    where: {size_id: req.query.size_id},
                    required: true})
        ])
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err.message, res));
    });
    
    //POST
    app.post('/stores/receipts', isLoggedIn, allowed('receipt_add', {send: true}), (req, res) => {
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
    
    //DELETE
    app.delete('/stores/receipts/:id', isLoggedIn, allowed('receipt_delete', {send: true}), (req, res) => {
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