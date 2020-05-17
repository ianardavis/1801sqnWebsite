module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/receipts',              isLoggedIn, allowed('access_receipts'),                    (req, res) => {
        fn.getAll(m.suppliers)
        .then(suppliers => res.render('stores/receipts/index', {suppliers: suppliers}))
        .catch(err => fn.error(err, '/stores', req, res));
    });
    //SHOW
    app.get('/stores/receipts/:id',          isLoggedIn, allowed('access_receipts'),                    (req, res) => {
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
    app.get('/stores/getreceipts',           isLoggedIn, allowed('access_receipts',      {send: true}), (req, res) => {
        fn.getAllWhere(
            m.receipts,
            req.query,
            {include: [
                inc.suppliers({as: 'supplier'}),
                inc.receipt_lines(),
                inc.users()
        ]})
        .then(receipts => res.send({result: true, receipts: receipts}))
        .catch(err => fn.send_error(err, res));
    });
    app.get('/stores/getreceiptlines',       isLoggedIn, allowed('access_receipt_lines', {send: true}), (req, res) => {
        fn.getAllWhere(
            m.receipt_lines,
            req.query,
            {include: [
                inc.sizes(),
                inc.receipts(),
                inc.stock({as: 'stock'})
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => fn.send_error(err, res));
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
        .catch(err => fn.send_error(err, res));
    });
    
    //POST
    app.post('/stores/receipts',             isLoggedIn, allowed('receipt_add',          {send: true}), (req, res) => {
        fn.createReceipt({
            supplier_id: req.body.supplier_id,
            user_id: req.user.user_id
        })
        .then(receipt_id => {
            let message = 'Receipt raised: ';
            if (!result.created) message = 'There is already an receipt open for this user: ';
            res.send({result: true, message: message + receipt_id})
        })
        .catch(err => fn.send_error(err, res));
    });
    app.post('/stores/receipt_lines/:id',    isLoggedIn, allowed('receipt_line_add',     {send: true}), (req, res) => {
        req.body.line.user_id    = req.user.user_id;
        req.body.line.receipt_id = req.params.id;
        fn.createReceiptLine(req.body.line)
        .then(receipt_id => res.send({result: true, message: 'Receipt raised: ' + receipt_id}))
        .catch(err => fn.send_error(err, res));
    });
    
    //DELETE
    app.delete('/stores/receipts/:id',       isLoggedIn, allowed('receipt_delete',       {send: true}), (req, res) => {
        fn.delete(
            m.receipt_lines,
            {receipt_id: req.params.id},
            true
        )
        .then(result => {
            fn.delete(
                m.receipts,
                {receipt_id: req.params.id}
            )
            .then(result => res.send({result: true, message: 'Receipt deleted'}))
            .catch(err => fn.send_error(err, res));
        })
        .catch(err => fn.send_error(err, res));
    });
};