module.exports = (app, m, fn) => {
    app.get('/receipts',        fn.loggedIn(), fn.permissions.get('access_receipts'),   (req, res) => res.render('canteen/receipts/index'));
    app.get('/receipts/:id',    fn.loggedIn(), fn.permissions.get('access_receipts'),   (req, res) => res.render('canteen/receipts/show'));
    
    app.get('/get/receipts',    fn.loggedIn(), fn.permissions.check('access_receipts'), (req, res) => {
        m.receipts.findAll({
            where: req.query,
            include: [
                fn.inc.users.user(),
                fn.inc.canteen.item()
            ]
        })
        .then(receipts => res.send({success: true,  result: receipts}))
        .catch(err =>     fn.send_error(res, err))
    });
    app.get('/get/receipt',     fn.loggedIn(), fn.permissions.check('access_receipts'), (req, res) => {
        fn.get(
            'receipts',
            req.query,
            [
                fn.inc.users.user(),
                fn.inc.canteen.item()
            ]
        )
        .then(receipt => res.send({success: true,  result: receipt}))
        .catch(err => fn.send_error(res, err))
    });

    app.post('/receipts',       fn.loggedIn(), fn.permissions.check('receipt_add'),     (req, res) => {
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
            return Promise.allSettled(actions)
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