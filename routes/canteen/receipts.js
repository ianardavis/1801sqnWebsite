module.exports = (app, m, inc, fn) => {
    app.get('/receipts',        fn.loggedIn(), fn.permissions.get('access_receipts'),   (req, res) => res.render('canteen/receipts/index'));
    app.get('/receipts/:id',    fn.loggedIn(), fn.permissions.get('access_receipts'),   (req, res) => res.render('canteen/receipts/show'));
    
    app.get('/get/receipts',    fn.loggedIn(), fn.permissions.check('access_receipts'), (req, res) => {
        m.receipts.findAll({
            where: req.query,
            include: [
                inc.user(),
                inc.item()
            ]
        })
        .then(receipts => res.send({success: true,  result: receipts}))
        .catch(err =>     fn.send_error(res, err))
    });
    app.get('/get/receipt',     fn.loggedIn(), fn.permissions.check('access_receipts'), (req, res) => {
        fn.get(
            'receipts',
            req.query,
            [
                inc.users(),
                inc.items()
            ]
        )
        .then(receipt => res.send({success: true,  result: receipt}))
        .catch(err => fn.send_error(res, err))
    });

    app.post('/receipts',       fn.loggedIn(), fn.permissions.check('receipt_add'),     (req, res) => {
        if (!req.body.receipts) fn.send_error(res, 'No items submitted')
        else {
            let actions = [];
            req.body.receipts.forEach(receipt => {
                actions.push(new Promise((resolve, reject) => {
                    if      (!receipt.qty)  reject(new Error('No quantity submitted'))
                    else if (!receipt.cost) reject(new Error('No cost submitted'))
                    else {
                        return fn.get(
                            'canteen_items',
                            {item_id: receipt.item_id}
                        )
                        .then(item => {
                            return m.receipts.create({
                                item_id: item.item_id,
                                qty:     receipt.qty,
                                cost:    receipt.cost,
                                user_id: req.user.user_id
                            })
                            .then(receipt => {
                                let receipt_qty = Number(receipt.qty);
                                if (item.qty < 0) {
                                    receipt_qty += Math.abs(item.qty);
                                    m.notes.create({
                                        _table:  'canteen_items',
                                        id:      item.item_id,
                                        note:    `Current quantity below 0. Increased by ${Math.abs(item.qty)} on receipt`,
                                        system:  1,
                                        user_id: req.user.user_id
                                    });
                                };
                                return item.increment('qty', {by: receipt_qty})
                                .then(result => {
                                    if (!result) reject(new Error('Item quantity not updated'))
                                    else {
                                        if (item.cost !== receipt.cost) {
                                            let qty_current = Math.max(0, item.qty),
                                                cost_new    = Number(((qty_current * item.cost) + (receipt.qty * receipt.cost)) / (qty_current + receipt.qty));
                                            return item.update({cost: cost_new})
                                            .then(result => {
                                                if (!result) resolve(true);
                                                else {
                                                    m.notes.create({
                                                        _table:  'canteen_items', 
                                                        id:      item.item_id,
                                                        note:    `Item cost updated from £${item.cost.toFixed(2)} to £${cost_new.toFixed(2)} by receipt`,
                                                        system:  1,
                                                        user_id: req.user.user_id
                                                    })
                                                    .then(note => resolve(true))
                                                    .catch(err => resolve(true))
                                                };
                                            })
                                            .catch(err => resolve(true))
                                        } else resolve(true);
                                    };
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    };
                }));
            });
            return Promise.allSettled(actions)
            .then(results => {
                if (results.filter(e => e.status === 'rejected').length > 0) {
                    console.log(results)
                    res.send({success: true, message: 'Some receipts failed'});
                } else res.send({success: true, message: 'Items received'});
            })
            .catch(err => fn.send_error(res, err));
        };
    });
    
    app.delete('/receipts/:id', fn.loggedIn(), fn.permissions.check('receipt_delete'),  (req, res) => {
        fn.get(
            'receipts', 
            {receipt_id: req.params.id}
        )
        .then(receipt => {
            return receipt.destroy()
            .then(result => {
                if (!result) fn.send_error(res, 'Receipt not deleted')
                else         res.send({success: true,  message: 'Receipt deleted'});
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};