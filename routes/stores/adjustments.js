module.exports = (app, m, fn) => {
    app.get('/get/adjustment',  fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'adjustments',
            req.query.where,
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
            where: req.query.where,
            include: [
                fn.inc.users.user(), 
                fn.inc.stores.stock()
            ],
            ...fn.pagination(req.query)
        })
        .then(adjustments => res.send({success: true, result: adjustments}))
        .catch(err => fn.send_error(res, err));
    });
};