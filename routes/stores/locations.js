module.exports = (app, m, fn) => {
    app.get('/locations/:id', fn.loggedIn(),                                      (req, res) => res.render('stores/locations/show'));
    app.get('/get/location',  fn.loggedIn(),                                      (req, res) => {
        m.locations.findOne({where: req.query.where})
        .then(location => {
            if (location) res.send({success: true, result: location})
            else res.send({success: false, message: 'Location not found'});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/locations', fn.loggedIn(),                                      (req, res) => {
        m.locations.findAndCountAll({
            where: req.query.where,
            ...fn.pagination(req.query)
        })
        .then(results =>fn.send_res('locations', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/locations/:id', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        m.locations.findOne({where: {location_id: req.params.id}})
        .then(location => {
            if (!location) fn.send_error(res, 'Location not found')
            else {
                m.locations.findOne({where: {location: req.body.location}})
                .then(new_location => {
                    if (new_location && location.location_id !== new_location.location_id) fn.send_error(res, 'Location already exists') ///merge???
                    else {
                        fn.update(location, {location: req.body.location})
                        .then(result => res.send({success: true, message: 'Location saved'}))
                        .catch(err => fn.send_error(res, err));
                    };
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.post('/locations',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.locations.create(req.body.location)
        .then(location_id => res.send({success: true, message: 'Location created'}))
        .catch(err => fn.send_error(res, err));
    });
};