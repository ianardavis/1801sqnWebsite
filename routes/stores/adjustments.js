module.exports = (app, m, fn) => {
    app.get('/get/adjustment',  fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'adjustments',
            JSON.parse(req.query.where),
            [
                fn.inc.users.user(), 
                fn.inc.stores.stock(),
                fn.inc.stores.size()
            ]
        )
        .then(adjustment => res.send({success: true, result: adjustment}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/adjustments', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.adjustments.findAll({
            where: JSON.parse(req.query.where),
            include: [
                fn.inc.users.user(), 
                fn.inc.stores.stock()
            ],
            ...fn.sort(req.query.sort)
        })
        .then(adjustments => res.send({success: true, result: adjustments}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/adjustments',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        if (!req.body.adjustments || req.body.adjustments.length === 0) fn.send_error(res, 'No adjustments')
        else {
            let actions = [];
            req.body.adjustments.forEach(adjustment => {
                if (adjustment.qty && adjustment.stock_id && adjustment.type) {
                    actions.push(
                        fn.stocks.adjust(adjustment.stock_id, adjustment.type, adjustment.qty, req.user.user_id)
                    );
                };
            });
            Promise.allSettled(actions)
            .then(results => {
                if (results.filter(e => e.status === 'rejected').length > 0) {
                    console.log(results);
                    res.send({success: true, message: 'Some adjustments failed'})
                } else res.send({success: true, message: 'Adjustment(s) actioned'});
            })
            .catch(err => fn.send_error(res, err));
        };
    });
};