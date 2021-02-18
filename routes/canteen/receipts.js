const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    app.get('/canteen/receipts',        pm, al('access_receipts'),               (req, res) => res.render('canteen/receipts/index'));
    app.get('/canteen/receipts/:id',    pm, al('access_receipts'),               (req, res) => res.render('canteen/receipts/show'));
    
    app.get('/canteen/get/receipts',    pm, al('access_receipts', {send: true}), (req, res) => {
        m.receipts.findAll({
            where: req.query,
            include: [
                inc.users(),
                inc.items()
            ]
        })
        .then(receipts => res.send({success: true,  result: receipts}))
        .catch(err =>     res.send({success: false, message: `Error getting receipts: ${err.message}`}))
    });
    app.get('/canteen/get/receipt',     pm, al('access_receipts', {send: true}), (req, res) => {
        m.receipts.findOne({
            where: req.query,
            include: [
                inc.users(),
                inc.items()
            ]
        })
        .then(receipt => {
            if (receipt) res.send({success: true,  result: receipt})
            else         res.send({success: false, message: 'Receipt not found'});
        })
        .catch(err => res.error.send(err, res))
    });

    app.post('/canteen/receipts',       pm, al('receipt_add',     {send: true}), (req, res) => {
        if      (!req.body.receipt._qty)  res.send({success: false, message: 'No quantity submitted'})
        else if (!req.body.receipt._cost) res.send({success: false, message: 'No cost submitted'})
        else {
            m.items.findOne({
                where:      {item_id: req.body.receipt.item_id},
                attributes: ['item_id', '_cost', '_qty']
            })
            .then(item => {
                if (!item) res.send({success: false, message: 'Item not found'})
                else {
                    return m.receipts.create({
                        item_id: item.item_id,
                        _qty:    req.body.receipt._qty,
                        _cost:   req.body.receipt._cost,
                        user_id: req.user.user_id
                    })
                    .then(receipt => {
                        let receipt_qty = Number(receipt._qty);
                        if (item._qty < 0) {
                            receipt_qty += Math.abs(item._qty);
                            m.notes.create({
                                _table:  'items',
                                _id:     item.item_id,
                                _note:   `Quantity below 0. Increased by ${Math.abs(item._qty)} on receipt ${receipt.receipt_id}`,
                                _system: 1,
                                user_id: req.user.user_id
                            });
                        };
                        return item.increment('_qty', {by: receipt_qty})
                        .then(result => {
                            if (!result) res.send({success: false, message: 'Item quantity not updated'})
                            else {
                                if (item._cost !== receipt._cost) {
                                    let qty_current   = Math.max(0, Number(item._qty)),
                                        value_current = qty_current * Number(item._cost),
                                        value_receipt = Number(receipt._qty) * Number(receipt._cost),
                                        qty_total     = qty_current + Number(receipt._qty),
                                        cost_new      = Number((value_current + value_receipt) / qty_total),
                                        cost_old      = Number(item._cost);
                                    return item.update({_cost: cost_new})
                                    .then(result => {
                                        if (!result) res.send({success: true, message: 'Item received, cost not updated'});
                                        else {
                                            m.notes.create({
                                                _table:  'items', 
                                                _id:     item.item_id,
                                                _note:   `Item cost updated from £${cost_old.toFixed(2)} to £${cost_new.toFixed(2)} by receipt ${receipt.receipt_id}`,
                                                _system: 1,
                                                user_id: req.user.user_id
                                            })
                                            .then(note => res.send({success: true, message: 'Item received, cost updated'}))
                                            .catch(err => res.send({success: true, message: 'Item received, cost updated'}))
                                        };
                                    })
                                    .catch(err => res.send({success: true, message: `Error updating item cost: ${err.message}`}))
                                } else res.send({success: true, message: 'Item received'});
                            };
                        })
                        .catch(err => res.send({success: false, message: `Error updating item quantity: ${err.message}`}));
                    })
                    .catch(err => res.send({success: false, message: `Error creating receipt: ${err.message}`}));
                };
            })
            .catch(err => res.send({success: false, message: `Error getting item: ${err.message}`}));
        };
    });
    
    app.delete('/canteen/receipts/:id', pm, al('receipt_delete',  {send: true}), (req, res) => {
        m.receipts.findOne({
            where: {receipt_id: req.params.id},
            attributes: ['receipt_id']
        })
        .then(receipt => {
            if (!receipt) res.send({success: false, message: 'Receipt not found'})
            else {
                return receipt.destroy()
                .then(result => {
                    if (!result) res.send({success: false, message: 'Receipt not deleted'})
                    else         res.send({success: true,  message: 'Receipt deleted'});
                })
                .catch(err => res.send({success: false, message: `Error deleting receipt: ${err.message}`}));
            }
        })
        .catch(err => res.error.send(err, res));
    });
};