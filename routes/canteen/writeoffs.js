module.exports = (app, fn) => {
    app.get('/writeoffs',     fn.loggedIn(), fn.permissions.get('canteen_stock_admin'),   (req, res) => res.render('canteen/writeoffs/index'));
    app.get('/writeoffs/:id', fn.loggedIn(), fn.permissions.get('canteen_stock_admin'),   (req, res) => res.render('canteen/writeoffs/show'));
    
    app.get('/get/writeoffs', fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.writeoffs.get_all(req.query)
        .then(results => fn.send_res('writeoffs', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/writeoff',  fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.writeoffs.get(req.query.where)
        .then(writeoff => res.send({success: true, result: writeoff}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/writeoffs',    fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.writeoffs.create(req.body.writeoff, req.user.user_id)
        .then(result => res.send({success: true, message: 'Stock written off'}))
        .catch(err => fn.send_error(res, err));
    });
};