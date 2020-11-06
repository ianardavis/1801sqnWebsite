module.exports = (app, allowed, inc, loggedIn, m) => {
    let db       = require(process.env.ROOT + '/fn/db'),
        receipts = require(process.env.ROOT + '/fn/receipts');;
    app.get('/stores/receipts',           loggedIn, allowed('access_receipts'),                (req, res) => res.render('stores/receipts/index'));
    app.get('/stores/receipts/:id',       loggedIn, allowed('access_receipts'),                (req, res) => res.render('stores/receipts/show', {tab: req.query.tab || 'details'}));
    
    app.post('/stores/receipts',          loggedIn, allowed('receipt_add',      {send: true}), (req, res) => {
        if (req.body.supplier_id && String(req.body.supplier_id).trim() !== '') 
            receipts.create({
                m: {
                    suppliers: m.suppliers,
                    receipts:  m.receipts
                },
                supplier_id: req.body.supplier_id,
                user_id:     req.user.user_id
            })
            .then(result => {
                let message = 'Receipt raised: ';
                if (!result.created) message = 'There is already an receipt open for this user: ';
                res.send({result: true, message: message + receipt_id})
            })
            .catch(err => res.error.send(err, res));
        else res.error.send('No supplier specified', res);
    });
    app.post('/stores/receipt_lines',     loggedIn, allowed('receipt_line_add', {send: true}), (req, res) => {
        receipts.createLine({
            m: {
                receipt_lines: m.receipt_lines,
                receipts:      m.receipts,
                locations:     m.locations,
                serials:       m.serials,
                sizes:         m.sizes,
                notes:         m.notes
            },
            // location_id: req.body.line.location_id,
            // location:    req.body.line.location,
            // receipt_id:  req.body.line.receipt_id,
            // size_id:     req.body.line.size_id,
            // serials:     req.body.line.serials,
            // _qty:        req.body.line._qty,
            // user_id:     req.user.user_id
            ...req.body.line,
            ...{user_id: req.user.user_id}
        })
        .then(result => {
            if (result.success) {
                if (result.results.filter(e => e.success === false).length === 0) {
                    res.send({result: true, message: 'Receipt line added'});
                } else {
                    res.send({result: true, message: 'Some lines have failed'});
                };
            } else {
                res.send({result: false, message: `Receipt line not added: ${result.message}`});
            };
        })
        .catch(err => res.error.send(err, res));
    });

    app.put('/stores/receipts',           loggedIn, allowed('receipt_edit',     {send: true}), (req, res) => {
        res.send({result: true, message: message + receipt_id})
    });
};