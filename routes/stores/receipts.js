module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        receipts = require(process.env.ROOT + '/fn/receipts');;
    app.get('/stores/receipts',                isLoggedIn, allowed('access_receipts'),                    (req, res) => {
        m.suppliers.findAll()
        .then(suppliers => res.render('stores/receipts/index', {suppliers: suppliers}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/receipts/:id',            isLoggedIn, allowed('access_receipts'),                    (req, res) => {
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
    app.get('/stores/get/receipts',            isLoggedIn, allowed('access_receipts',      {send: true}), (req, res) => {
        m.receipts.findAll({
            where: req.query,
            include: [
                inc.suppliers({as: 'supplier'}),
                inc.receipt_lines(),
                inc.users()
        ]})
        .then(receipts => res.send({result: true, receipts: receipts}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/receiptlines',        isLoggedIn, allowed('access_receipt_lines', {send: true}), (req, res) => {
        m.receipt_lines.findAll({
            where: req.query,
            include: [
                inc.sizes(),
                inc.receipts(),
                inc.stock({as: 'stock'})
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/receiptlines/bysize', isLoggedIn, allowed('access_receipt_lines', {send: true}), (req, res) => {
        m.receipt_lines.findAll({
            include: [
                inc.receipts(),
                inc.users(),
                inc.stock({
                    as: 'stock',
                    where: {size_id: req.query.size_id},
                    required: true})
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/receipts',               isLoggedIn, allowed('receipt_add',          {send: true}), (req, res) => {
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
    app.post('/stores/receipt_lines/:id',      isLoggedIn, allowed('receipt_line_add',     {send: true}), (req, res) => {
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
    app.delete('/stores/receipts/:id',         isLoggedIn, allowed('receipt_delete',       {send: true}), (req, res) => {
        m.receipt_lines.destroy({where: {receipt_id: req.params.id}})
        .then(result => {
            db.destroy({
                table: m.receipts,
                where: {receipt_id: req.params.id}
            })
            .then(result => res.send({result: true, message: 'Receipt deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
};