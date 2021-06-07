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
        if (!req.body.adjustments) fn.send_error(res, 'No adjustments')
        else {
            let actions = [];
            req.body.adjustments.forEach(adjustment => {
                actions.push(
                    new Promise((resolve, reject) => {
                        if (adjustment.stock_id && adjustment.qty && adjustment.type) {
                            m.stocks.findOne({
                                where: {stock_id:adjustment.stock_id},
                                attributes: ['stock_id', 'size_id', 'qty']
                            })
                            .then(stock => {
                                if (!stock) reject(new Error('Stock not found'))
                                else {
                                    let action = null;
                                    if (adjustment.type === 'Count') {
                                        adjustment.variance = Number(adjustment.qty) - Number(stock.qty);
                                        action = stock.update({qty: adjustment.qty});
                                    } else if (adjustment.type === 'Scrap') {
                                        adjustment.variance = 0 - adjustment.qty;
                                        action = stock.decrement('qty', {by: adjustment.qty});
                                    };
                                    if (action) {
                                        return action
                                        .then(result => {
                                            return m.adjustments.create({
                                                ...adjustment,
                                                user_id: req.user.user_id,
                                                size_id: stock.size_id
                                            })
                                            .then(adjustment => resolve(true))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    } else reject(new Error('Could not set adjustment action'));
                                };
                            })
                            .catch(err => reject(err));
                        } else reject(new Error('Not all required details submitted'));
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                if (results.filter(e => e.status === 'rejected').length > 0) res.send({success: true, message: 'Some adjustments failed'})
                else res.send({success: true, message: 'Adjustment(s) actioned'});
            })
            .catch(err => fn.send_error(res, err));
        };
    });
};