module.exports = (app, fn) => {
    app.get('/receipts',     fn.loggedIn, fn.permissions.get('canteen_stock_admin'),   (req, res) => res.render('canteen/receipts/index'));
    app.get('/receipts/:id', fn.loggedIn, fn.permissions.get('canteen_stock_admin'),   (req, res) => res.render('canteen/receipts/show'));
    
    app.get('/get/receipts', fn.loggedIn, fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.receipts.find_and_count_all(req.query.where, fn.pagination(req.query))
        .then(results => fn.sendRes('receipts', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/receipt',  fn.loggedIn, fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.receipts.find(req.query.where)
        .then(receipt => res.send({success: true, result: receipt}))
        .catch(reject);
    });

    app.post('/receipts',    fn.loggedIn, fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.receipts.create(
            req.body.receipts,
            req.user.user_id
        )
        .then(results => res.send({success: true, message: 'Items received'}))
        .catch(err => fn.sendError(res, err));
    });
};