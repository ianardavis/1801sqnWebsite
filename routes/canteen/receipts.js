const op = require('sequelize').Op;
module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/canteen/receipts',             permissions, allowed('access_receipts'),                    (req, res) => res.render('canteen/receipts/index'));
    app.get('/canteen/receipts/:id',         permissions, allowed('access_receipts'),                    (req, res) => res.render('canteen/receipts/show'));
    
    app.get('/canteen/get/receipts',         permissions, allowed('access_receipts',      {send: true}), (req, res) => {
        m.receipts.findAll({
            include: [inc.users()],
            where: req.query
        })
        .then(receipts => res.send({result: true, receipts: receipts}))
        .catch(err => res.error.send(err, res))
    });
    app.get('/canteen/get/receipt',          permissions, allowed('access_receipts',      {send: true}), (req, res) => {
        m.receipts.findOne({
            where: req.query,
            include: [inc.users()]
        })
        .then(receipt => {
            if (receipt) res.send({result: true,  receipt: receipt})
            else         res.send({result: false, message: 'Receipt not found'});
        })
        .catch(err => res.error.send(err, res))
    });
    app.get('/canteen/get/receipt_lines',    permissions, allowed('access_receipt_lines', {send: true}), (req, res) => {
        m.receipt_lines.findAll({
            include: [
                inc.items(),
                inc.users()
            ],
            where: req.query
        })
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res))
    });

    app.post('/canteen/receipts',            permissions, allowed('receipt_add',          {send: true}), (req, res) => {
        m.receipts.findOrCreate({
            where:    {_status: 1},
            defaults: {user_id: req.user.user_id}
        })
        .then(([writeoff, created]) => {
            if (created) res.send({result: true,  message: 'Receipt created'})
            else         res.send({result: false, message: 'Receipt already open'});
        })
    
    });
    app.post('/canteen/receipt_lines/:id',   permissions, allowed('receipt_line_add',     {send: true}), (req, res) => {
        m.receipts.findOne({
            where: {receipt_id: req.params.id},
            attributes: ['receipt_id']
        })
        .then(receipt => {
            if (receipt) {
                return m.receipt_lines.findOrCreate({
                    where: {
                        receipt_id: receipt.receipt_id,
                        item_id:    req.body.line.item_id
                    },
                    defaults: {
                        _qty:    req.body.line._qty,
                        _cost:   req.body.line._cost,
                        user_id: req.user.user_id
                    }
                })
                .then(([line, created]) => {
                    if (created) res.send({result: true, message: 'Line added'})
                    else {
                        let actions = [line.increment('_qty', {by: req.body.line._qty})];
                        if (line._cost !== req.body.line._cost) {
                            actions.push(
                                line.update({
                                    _cost: ((line._qty * line._cost) + (Number(req.body.line._qty) * Number(req.body.line._cost))) / (line._qty + Number(req.body.line._qty))
                                })
                            );
                        };
                        return Promise.all(actions)
                        .then(result => res.send({result: true, message: 'Line updated'}))
                        .catch(err => res.error.send(err, res));
                    };
                })
                .catch(err => res.error.send(err, res));
            } else res.send({result: false, message: 'Receipt not found'});
        })
        .catch(err => res.error.send(err, res));
    
    });

    app.put('/canteen/receipts/:id',         permissions, allowed('receipt_edit',         {send: true}), (req, res) => {
        m.receipts.findOne({
            where: {receipt_id: req.params.id},
            attributes: ['receipt_id', '_status'],
            include: [inc.receipt_lines({as: 'lines'})]
        })
        .then(receipt => {
            if      (!receipt)              res.send({result: false, message: 'Receipt not found'})
            else if (receipt._status !== 1) res.send({result: false, message: 'Receipt is not open'})
            else {
                let actions = [];
                actions.push(
                    new Promise((resolve, reject) => {
                        let complete_actions = [];
                        receipt.lines.forEach(line => {
                            complete_actions.push(
                                new Promise((resolve, reject) => {
                                    m.items.findOne({
                                        where: {item_id: line.item_id},
                                        attributes: ['item_id', '_qty', '_cost']
                                    })
                                    .then(item => {
                                        let item_actions = [item.increment('_qty', {by: line._qty})];
                                        if (line._cost !== item._cost) {
                                            item_actions.push(
                                                m.notes.create({
                                                    _id: line.item_id,
                                                    _table: 'items',
                                                    _note: `Cost changed from £${Number(item._cost).toFixed(2)} to £${Number(line._cost).toFixed(2)}`,
                                                    user_id: req.user.user_id,
                                                    _system: 1
                                                })
                                            );
                                            item_actions.push(
                                                item.update({
                                                    _cost: ((item._qty * item._cost) + (line._qty * line._cost)) / (item._qty + line._qty)
                                                })
                                            );
                                        };
                                        return Promise.all(item_actions)
                                        .then(result => {
                                            line.update({_status: 2})
                                            .then(result => resolve(true))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err))
                                })
                            );
                        });
                        Promise.all(complete_actions)
                        .then(result => resolve('Lines completed'))
                        .catch(err => reject(err));
                    })
                );
                actions.push(receipt.update({_status: 2}));
                actions.push(
                    m.notes.create({
                        _id: receipt.receipt_id,
                        _table: 'receipts',
                        _note: 'Completed',
                        user_id: req.user.user_id,
                        _system: 1
                    })
                );
                return Promise.all(actions)
                .then(result => res.send({result: true, message: `Receipt completed`}))
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.send(err, res));
    });
    
    app.delete('/canteen/receipt_lines/:id', permissions, allowed('receipt_line_delete',  {send: true}), (req, res) => {
        m.receipt_lines.update({_status: 0}, {where: {line_id: req.params.id}})
        .then(result => res.send({result: true, message: 'Line cancelled'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/canteen/receipts/:id',      permissions, allowed('receipt_delete',       {send: true}), (req, res) => {
        m.receipts.findOne({
            where: {receipt_id: req.params.id},
            attributes: ['receipt_id', '_status']
        })
        .then(receipt => {
            if      (!receipt)              res.send({result: false, message: 'Receipt not found'})
            else if (receipt._status !== 1) res.send({result: false, message: 'Receipt is not open'})
            else {
                let actions = [];
                actions.push(receipt.update({_status: 0}));
                actions.push(m.receipt_lines.update({_status: 0}, {where: {receipt_id: receipt.receipt_id}}));
                actions.push(
                    m.notes.create({
                        _id: receipt.receipt_id,
                        _table: 'receipts',
                        _note: 'Cancelled',
                        user_id: req.user.user_id,
                        _system: 1
                    })
                );
                return Promise.all(actions)
                .then(result => res.send({result: true, message: 'Receipt cancelled'}))
                .catch(err => res.error.send(err, res));
            }
        })
        .catch(err => res.error.send(err, res));
    });
};