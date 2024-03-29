module.exports = (app, fn) => {
    app.get('/locations/:id', fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/locations/show'));
    app.get('/get/location',  fn.loggedIn(),                                             (req, res) => {
        fn.locations.get(req.query.where)
        .then(location => res.send({success: true, result: location}))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/locations', fn.loggedIn(),                                             (req, res) => {
        fn.locations.findAll(req.query)
        .then(locations => fn.sendRes('locations', res, locations, req.query))
        .catch(err => fn.sendError(res, err));
    });

    app.put('/locations/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.locations.edit(req.params.id, req.body.location)
        .then(result => res.send({success: result, message: `Location ${result ? '' : 'not '}saved`}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/locations',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.locations.findOrCreate(req.body.location.location)
        .then(location_id => res.send({success: true, message: 'Location created'}))
        .catch(err => fn.sendError(res, err));
    });
};