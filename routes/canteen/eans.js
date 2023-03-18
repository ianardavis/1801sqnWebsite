module.exports = (app, fn) => {
    app.get('/get/eans',    fn.loggedIn(), fn.permissions.check('access_canteen'),      (req, res) => {
        fn.eans.get_all(req.query.where, fn.pagination(req.query))
        .then(results => fn.send_res('items', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/eans',       fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.eans.create(req.body.ean)
        .then(item => res.send({success: true, message: 'Item added'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/eans/:id', fn.loggedIn(), fn.permissions.check('canteen_stock_admin'), (req, res) => {
        fn.eans.delete(req.params.id)
        .then(result => res.send({success: true,  message: 'Item deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};