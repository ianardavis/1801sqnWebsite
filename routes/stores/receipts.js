module.exports = (app, allowed, inc, loggedIn, m) => {
    let receipts = require(process.env.ROOT + '/fn/stores/receipts');;
    app.get('/stores/receipts',             loggedIn, allowed('access_receipts'),                   (req, res) => res.render('stores/receipts/index'));
    app.get('/stores/receipts/:id',         loggedIn, allowed('access_receipts'),                   (req, res) => res.render('stores/receipts/show', {tab: req.query.tab || 'details'}));
    
    app.post('/stores/receipts',            loggedIn, allowed('receipt_add',         {send: true}), (req, res) => {
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
    app.post('/stores/receipt_lines',       loggedIn, allowed('receipt_line_add',    {send: true}), (req, res) => {
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
            if (result.success === true) {
                if (result.results.filter(e => e.success === false).length === 0) {
                    res.send({result: true, message: 'Receipt line added'});
                } else {
                    res.send({result: true, message: 'Some lines have failed'});
                };
            } else {
                res.send({result: false, message: result.message});
            };
        })
        .catch(err => res.error.send(err, res));
    });

    app.put('/stores/receipts',             loggedIn, allowed('receipt_edit',        {send: true}), (req, res) => {
        res.send({result: true, message: ''})
    });

    app.delete('/stores/receipts/:id',      loggedIn, allowed('receipt_delete',      {send: true}), (req, res) => {
        return m.receipts.findOne({
            where: {receipt_id: req.params.id},
            attributes: ['receipt_id', '_status']
        })
        .then(receipt => {
            if (receipt._status !== 1) {
                res.send({result: false, message: 'Only draft receipts can be cancelled'});
            } else {
                return m.receipt_lines.findAll({
                    where: {
                        receipt_id: receipt.receipt_id,
                        _status: 1
                    },
                    attributes: ['line_id']
                })
                .then(lines => {
                    let actions = [];
                    lines.forEach(line => {
                        actions.push(
                            m.notes.create({
                                _id:     line.line_id,
                                _table:  'receipt_lines',
                                _note:   'Receipt cancelled',
                                user_id: req.user.user_id,
                                _system: 1
                            })
                        );
                    });
                    actions.push(
                        m.receipt_lines.update(
                            {_status: 0},
                            {where: {
                                receipt_id: receipt.receipt_id,
                                _status: 1
                            }}
                        )
                    );
                    actions.push(receipt.update({_status: 0}));
                    actions.push(
                        m.notes.create({
                            _id:     receipt.receipt_id,
                            _table:  'receipts',
                            _note:   'Cancelled',
                            user_id: req.user.user_id,
                            _system: 1
                        })
                    )
                    return Promise.allSettled(actions)
                    .then(receipt_result => {
                        res.send({result: true, message: 'Receipt cancelled'});
                    })
                    .catch(err => res.send.error(err, res));
                })
                .catch(err => res.send.error(err, res));
            };
        })
        .catch(err => res.send.error(err, res));
    });
    app.delete('/stores/receipt_lines/:id', loggedIn, allowed('receipt_line_delete', {send: true}), (req, res) => {
        return m.receipt_lines.findOne({
            where: {line_id: req.params.id},
            include: [inc.receipts({attributes: ['_status']})],
            attributes: ['line_id', '_status']
        })
        .then(line => {
            if (line._status !== 1) {
                res.error.send('Only pending lines can be cancelled', res);
            } else if (line.receipt._status !== 1) {
                res.error.send('Lines can only be cancelled on draft orders', res);
            } else {
                return line.update({_status: 0})
                .then(result => {
                    if (result) {
                        m.notes.create({
                            _id: line.line_id,
                            _table: 'receipt_lines',
                            _note: 'Cancelled',
                            user_id: req.user.user_id,
                            _system: 1
                        })
                        .then(note => res.send({result: true, message: 'Line cancelled'}))
                        .catch(err => res.error.send(err, res));
                    } else {
                        res.error.send('Unable to cancel line', res);
                    };
                })
            };
        })
        .catch(err => res.error.send(err, res));
    });
};