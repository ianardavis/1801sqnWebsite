module.exports = (app, m, fn) => {
    app.get('/receipts',        fn.loggedIn(), fn.permissions.get('canteen_stock_admin'),   (req, res) => res.render('canteen/receipts/index'));
    app.get('/receipts/:id',    fn.loggedIn(), fn.permissions.get('canteen_stock_admin'),   (req, res) => res.render('canteen/receipts/show'));
    
    app.get('/get/receipts',    fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        m.receipts.findAndCountAll({
            where: req.query.where,
            include: [
                fn.inc.users.user(),
                fn.inc.canteen.item()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('receipts', res, results, req.query))
        .catch(err =>     fn.send_error(res, err))
    });
    app.get('/get/receipt',     fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        m.receipts.findOne({
            where: req.query.where,
            include: [
                fn.inc.users.user(),
                fn.inc.canteen.item()
            ]
        })
        .then(receipt => {
            if (receipt) res.send({success: true, result: receipt})
            else res.send({success: false, message: 'Receipt not found'});
        })
        .catch(err => fn.send_error(res, err))
    });

    app.post('/receipts',       fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        if (!req.body.receipts) fn.send_error(res, 'No items submitted')
        else {
            let actions = [];
            req.body.receipts.forEach(receipt => {
                actions.push(
                    fn.receipts.create(
                        receipt,
                        req.user.user_id
                    )
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                if (results.filter(e => e.status === 'rejected').length > 0) {
                    console.log(results)
                    res.send({success: true, message: 'Some receipts failed'});
                } else res.send({success: true, message: 'Items received'});
            })
            .catch(err => fn.send_error(res, err));
        };
    });
};