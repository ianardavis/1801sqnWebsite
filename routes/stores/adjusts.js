module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/adjusts', li, pm.check('access_adjusts', {send: true}), (req, res) => {
        m.adjusts.findAll({
            where: req.query,
            include: [
                inc.user(), 
                inc.stock()
            ]
        })
        .then(adjusts => res.send({success: true, result: adjusts}))
        .catch(err => send_error(res, err));
    });

    app.post('/adjusts',    li, pm.check('adjustment_add', {send: true}), (req, res) => {
        if (req.body.adjust.stock_id && req.body.adjust.qty && req.body.adjust.type) {
            m.stocks.findOne({
                where: {stock_id: req.body.adjust.stock_id},
                attributes: ['stock_id', 'size_id', 'qty']
            })
            .then(stock => {
                if (stock) {
                    req.body.adjust.user_id = req.user.user_id;
                    req.body.adjust.size_id = stock.size_id;
                    let action = null;
                    if (req.body.adjust.type === 'Count') {
                        req.body.adjust.variance = Number(req.body.adjust.qty) - Number(stock.qty);
                        action = stock.update({_qty: req.body.adjust.qty});
                    } else if (req.body.adjust.type === 'Scrap') {
                        req.body.adjust.variance = 0 - req.body.adjust.qty;
                        action = stock.decrement('qty', {by: req.body.adjust.qty});
                    };
                    if (action) {
                        return action
                        .then(result => {
                            return m.adjusts.create(req.body.adjust)
                            .then(adjust => res.send({success: true, message: 'Adjustment added'}))
                            .catch(err => send_error(res, err));
                        })
                        .catch(err => send_error(res, err));
                    } else send_error(res, 'Could not set adjustment action');
                } else send_error(res, 'Stock not found');
            })
            .catch(err => send_error(res, err));
        } else send_error(res, 'Not all required details submitted'); 
    });
};