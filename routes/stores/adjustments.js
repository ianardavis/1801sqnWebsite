module.exports = (app, m, inc, fn) => {
    app.get('/get/adjustment',  fn.li(), fn.permissions.check('access_adjustments', {send: true}), (req, res) => {
        m.adjustments.findOne({
            where: req.query,
            include: [
                inc.user(), 
                inc.stock(),
                inc.size()
            ]
        })
        .then(adjustment => res.send({success: true, result: adjustment}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/adjustments', fn.li(), fn.permissions.check('access_adjustments', {send: true}), (req, res) => {
        m.adjustments.findAll({
            where: req.query,
            include: [
                inc.user(), 
                inc.stock()
            ]
        })
        .then(adjustments => res.send({success: true, result: adjustments}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/adjustments',    fn.li(), fn.permissions.check('adjustment_add',     {send: true}), (req, res) => {
        if (req.body.adjustment.stock_id && req.body.adjustment.qty && req.body.adjustment.type) {
            m.stocks.findOne({
                where: {stock_id: req.body.adjustment.stock_id},
                attributes: ['stock_id', 'size_id', 'qty']
            })
            .then(stock => {
                if (!stock) fn.send_error(res, 'Stock not found')
                else {
                    let action = null;
                    if (req.body.adjustment.type === 'Count') {
                        req.body.adjustment.variance = Number(req.body.adjustment.qty) - Number(stock.qty);
                        action = stock.update({qty: req.body.adjustment.qty});
                    } else if (req.body.adjustment.type === 'Scrap') {
                        req.body.adjustment.variance = 0 - req.body.adjustment.qty;
                        action = stock.decrement('qty', {by: req.body.adjustment.qty});
                    };
                    if (action) {
                        return action
                        .then(result => {
                            return m.adjustments.create({
                                ...req.body.adjustment,
                                user_id: req.user.user_id,
                                size_id: stock.size_id
                            })
                            .then(adjustment => res.send({success: true, message: 'Adjustment added'}))
                            .catch(err => fn.send_error(res, err));
                        })
                        .catch(err => fn.send_error(res, err));
                    } else fn.send_error(res, 'Could not set adjustment action');
                };
            })
            .catch(err => fn.send_error(res, err));
        } else fn.send_error(res, 'Not all required details submitted'); 
    });
};