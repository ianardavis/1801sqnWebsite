module.exports = (app, m, fn) => {
    app.get('/locations/:id', fn.loggedIn(), fn.permissions.get('access_locations'),   (req, res) => res.render('stores/locations/show'));
    app.get('/get/location',  fn.loggedIn(), fn.permissions.check('access_locations'), (req, res) => {
        fn.get(
            'locations',
            req.query
        )
        .then(location => res.send({success: true, result: location}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/locations', fn.loggedIn(), fn.permissions.check('access_locations'), (req, res) => {
        m.locations.findAll({where: req.query})
        .then(locations => res.send({success: true, result: locations}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/locations/:id', fn.loggedIn(), fn.permissions.check('location_edit'),    (req, res) => {
        m.locations.findOne({where: {location_id: req.params.id}})
        .then(location => {
            if (!location) fn.send_error(res, 'Location not found')
            else {
                return m.locations.findOne({where: {location: req.body.location}})
                .then(new_location => {
                    if (new_location && location.location_id !== new_location.location_id) fn.send_error(res, 'Location already exists') ///merge???
                    else {
                        return location.update({location: req.body.location})
                        .then(result => {
                            if (!result) fn.send_error(res, 'Location not saved')
                            else res.send({success: true, message: 'Location saved'});
                        })
                    };
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.post('/locations',    fn.loggedIn(), fn.permissions.check('location_add'),     (req, res) => {
        fn.locations.create({location: req.body.location})
        .then(location => res.send({success: true, message: 'Location created'}))
        .catch(err => fn.send_error(res, err));
    });
};