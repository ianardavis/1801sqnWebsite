module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/adjusts', pm.check('access_adjusts', {send: true}), (req, res) => {
        m.adjusts.findAll({
            where:   req.query,
            include: [
                inc.users(), 
                inc.stocks({as: 'stock'})
            ]
        })
        .then(adjusts => res.send({success: true, result: adjusts}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/adjusts',    pm.check('adjustment_add', {send: true}), (req, res) => {
        if (req.body.adjust.stock_id && req.body.adjust._qty && req.body.adjust._type) {
            m.stocks.findOne({
                where: {stock_id: req.body.adjust.stock_id},
                attributes: ['stock_id', 'size_id', '_qty']
            })
            .then(stock => {
                if (stock) {
                    req.body.adjust.user_id = req.user.user_id;
                    req.body.adjust.size_id = stock.size_id;
                    let action = null;
                    if (req.body.adjust._type === 'Count') {
                        req.body.adjust._variance = Number(req.body.adjust._qty) - Number(stock._qty);
                        action = stock.update({_qty: req.body.adjust._qty});
                    } else if (req.body.adjust._type === 'Scrap') {
                        req.body.adjust._variance = 0 - req.body.adjust._qty;
                        action = stock.decrement('_qty', {by: req.body.adjust._qty});
                    };
                    if (action) {
                        return action
                        .then(result => {
                            return m.adjusts.create(req.body.adjust)
                            .then(adjust => res.send({success: true, message: 'Adjustment added'}))
                            .catch(err => res.error.send(err, res));
                        })
                        .catch(err => res.error.send(err, res));
                    } else res.send({success: false, message: 'Could not set adjustment action'});
                } else res.send({success: false, message: 'Stock not found'});
            })
            .catch(err => res.error.send(err, res));
        } else res.send({success: false, message: 'Not all required details submitted'}); 
    });
};