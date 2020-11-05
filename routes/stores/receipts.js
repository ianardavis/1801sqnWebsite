module.exports = (app, allowed, inc, loggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        receipts = require(process.env.ROOT + '/fn/receipts');;
    app.get('/stores/receipts',           loggedIn, allowed('access_receipts'),                (req, res) => res.render('stores/receipts/index'));
    app.get('/stores/receipts/:id',       loggedIn, allowed('access_receipts'),                (req, res) => res.render('stores/receipts/show', {tab: req.query.tab || 'details'}));
    
    app.post('/stores/receipts',          loggedIn, allowed('receipt_add',      {send: true}), (req, res) => {
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
    app.post('/stores/receipt_lines/:id', loggedIn, allowed('receipt_line_add', {send: true}), (req, res) => {
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