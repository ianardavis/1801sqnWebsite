module.exports = (app, fn) => {
    app.get('/writeoffs',     fn.loggedIn(), fn.permissions.get('canteen_stock_admin'),   (req, res) => res.render('canteen/writeoffs/index'));
    app.get('/writeoffs/:id', fn.loggedIn(), fn.permissions.get('canteen_stock_admin'),   (req, res) => res.render('canteen/writeoffs/show'));
    
    app.get('/get/writeoffs', fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.writeoffs.findAll(req.query)
        .then(results => fn.sendRes('writeoffs', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/writeoff',  fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.writeoffs.find(req.query.where)
        .then(writeoff => res.send({success: true, result: writeoff}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/writeoffs',    fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.writeoffs.create(req.body.writeoff, req.user.user_id)
        .then(result => res.send({success: true, message: 'Stock written off'}))
        .catch(err => fn.sendError(res, err));
    });
};