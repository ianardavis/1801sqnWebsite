module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        receipts = require(process.env.ROOT + '/fn/receipts');;
    app.get('/stores/receipts',           isLoggedIn, allowed('access_receipts'),                (req, res) => {
        m.suppliers.findAll()
        .then(suppliers => res.render('stores/receipts/index', {suppliers: suppliers}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/receipts/:id',       isLoggedIn, allowed('access_receipts'),                (req, res) => {
        db.findOne({
            table: m.receipts,
            where: {receipt_id: req.params.id},
            include: [
                inc.users(),
                inc.suppliers({as: 'supplier'})
        ]})
        .then(receipt => {
            res.render('stores/receipts/show', {
                receipt: receipt,
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.post('/stores/receipts',          isLoggedIn, allowed('receipt_add',      {send: true}), (req, res) => {
        receipts.create({
            m: {receipts: m.receipts},
            receipt: {
                supplier_id: req.body.supplier_id,
                user_id:     req.user.user_id
            }
        })
        .then(result => {
            let message = 'Receipt raised: ';
            if (!result.created) message = 'There is already an receipt open for this user: ';
            res.send({result: true, message: message + receipt_id})
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/receipt_lines/:id', isLoggedIn, allowed('receipt_line_add', {send: true}), (req, res) => {
        req.body.line.user_id    = req.user.user_id;
        req.body.line.receipt_id = req.params.id;
        receipts.createLine({
            m: {
                sizes: m.sizes,
                stock: m.stock,
                receipts: m.receipts,
                receipt_lines: m.receipt_lines,
                serials: m.serials
            },
            line: req.body.line
        })
        .then(receipt_id => res.send({result: true, message: 'Receipt raised: ' + receipt_id}))
        .catch(err => res.error.send(err, res));
    });
};