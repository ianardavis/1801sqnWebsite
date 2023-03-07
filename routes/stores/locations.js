module.exports = (app, fn) => {
    app.get('/locations/:id', fn.loggedIn(),                                             (req, res) => res.render('stores/locations/show'));
    app.get('/get/location',  fn.loggedIn(),                                             (req, res) => {
        fn.locations.get(req.query.where)
        .then(location => res.send({success: true, result: location}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/locations', fn.loggedIn(),                                             (req, res) => {
        fn.locations.getAll(req.query.where, fn.pagination(req.query))
        .then(locations => fn.send_res('locations', res, locations, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/locations/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.locations.edit(req.params.id, req.body.location)
        .then(result => res.send({success: result, message: `Location ${result ? '' : 'not '}saved`}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/locations',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.locations.findOrCreate(req.body.location.location)
        .then(location_id => res.send({success: true, message: 'Location created'}))
        .catch(err => fn.send_error(res, err));
    });
};