module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/locations/:id', li, pm.get, pm.check('access_locations'),               (req, res) => res.render('stores/locations/show'));
    app.get('/get/location',  li,         pm.check('access_locations', {send: true}), (req, res) => {
        m.locations.findOne({where: req.query})
        .then(location => res.send({success: true, result: location}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/locations', li,         pm.check('access_locations', {send: true}), (req, res) => {
        m.locations.findAll({where: req.query})
        .then(locations => res.send({success: true, result: locations}))
        .catch(err => send_error(res, err));
    });

    app.put('/locations/:id', li,         pm.check('location_edit',    {send: true}), (req, res) => {
        m.locations.findOne({where: {location_id: req.params.id}})
        .then(location => {
            if (!location) send_error(res, 'Location not found')
            else {
                return m.locations.findOne({where: {location: req.body.location}})
                .then(new_location => {
                    if (new_location && location.location_id !== new_location.location_id) send_error(res, 'Location already exists') ///merge???
                    else {
                        return location.update({location: req.body.location})
                        .then(result => {
                            if (!result) send_error(res, 'Location not saved')
                            else res.send({success: true, message: 'Location saved'});
                        })
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};