module.exports = (app, fn) => {
    app.get('/get/detail',     fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        fn.sizes.details.get(req.query.where)
        .then(detail => res.send({success: true, result: detail}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/details',    fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        fn.sizes.details.getAll(req.query)
        .then(details => fn.send_res('details', res, details, req.query))
        .catch(err =>    fn.send_error(res, err));
    });

    app.post('/details',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.sizes.details.create(req.body.detail)
        .then(detail => res.send({success: true, message: 'Detail saved'}))
        .catch(err => fn.send_error(res, err));
    });
    
    app.put('/detail',         fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.sizes.details.edit(req.body.detail_id, req.body.detail)
        .then(result => res.send({success: result, message: `Detail ${(result ? '' : 'not ')}saved`}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/details',        fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.sizes.details.updateBulk(req.body.sizes)
        .then(result => res.send({success: true, message: 'Detail saved'}))
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/details/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.sizes.details.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Detail deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};