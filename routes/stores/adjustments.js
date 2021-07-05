module.exports = (app, m, fn) => {
    app.get('/get/adjustment',  fn.loggedIn(), fn.permissions.check('access_adjustments', {send: true}), (req, res) => {
        fn.get(
            'adjustments',
            req.query,
            [
                fn.inc.users.user(), 
                fn.inc.stores.stock(),
                fn.inc.stores.size()
            ]
        )
        .then(adjustment => res.send({success: true, result: adjustment}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/adjustments', fn.loggedIn(), fn.permissions.check('access_adjustments', {send: true}), (req, res) => {
        m.adjustments.findAll({
            where: req.query,
            include: [
                fn.inc.users.user(), 
                fn.inc.stores.stock()
            ]
        })
        .then(adjustments => res.send({success: true, result: adjustments}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/adjustments',    fn.loggedIn(), fn.permissions.check('adjustment_add',     {send: true}), (req, res) => {
        if (!req.body.adjustments) fn.send_error(res, 'No adjustments')
        else {
            let actions = [];
            req.body.adjustments.forEach(adjustment => {
                if (adjustment.qty) {
                    actions.push(
                        new Promise((resolve, reject) => {
                            if (adjustment.stock_id && adjustment.qty && adjustment.type) {
                                return fn.get(
                                    'stocks',
                                    {stock_id:adjustment.stock_id}
                                )
                                .then(stock => {
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
                                })
                                .catch(err => reject(err));
                            } else reject(new Error('Not all required details submitted'));
                        })
                    );
                };
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