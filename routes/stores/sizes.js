module.exports = (app, fn) => {
    app.get('/sizes/select', fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/sizes/select'));
    app.get('/sizes/:id',    fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/sizes/show'));

    app.get('/count/sizes',  fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.sizes.count(req.query.where)
        .then(count => res.send({success: true, result: count}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/size',     fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.sizes.find(req.query.where)
        .then(size => res.send({success: true, result: size}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/sizes',    fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.sizes.findAll(req.query)
        .then(sizes => fn.sendRes('sizes', res, sizes, req.query))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/sizes',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.sizes.create(req.body.size)
        .then(size => res.send({success: true, message: 'Size added'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/sizes/:id',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.sizes.edit(req.params.id, req.body.size)
        .then(result => res.send({success: true, message: 'Size saved'}))
        .catch(err => fn.sendError(res, err));
    });

    app.delete('/sizes/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.sizes.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Size deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};