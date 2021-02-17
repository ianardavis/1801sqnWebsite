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
                        return  item.increment('_qty', {by: receipt._qty})
                        .then(result => {
                            if (!result) res.send({success: false, message: 'Item quantity not updated'})
                            else {
                                if (item._cost !== receipt._cost) {
                                    return item.update({
                                        _cost: ((item._qty * item._cost) + (receipt._qty * receipt._cost)) / (item._qty + receipt._qty)
                                    })
                                    .then(result => {
                                        if (!result) res.send({success: true, message: 'Item received, cost not updated'});
                                        else         res.send({success: true, message: 'Item received, cost updated'})
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