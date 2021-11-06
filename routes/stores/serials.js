module.exports = (app, m, fn) => {
    app.get('/serials/:id',         fn.loggedIn(), fn.permissions.get('access_stores'),   (req, res) => res.render('stores/serials/show'));
    app.get('/get/serials',         fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        m.serials.findAll({
            where:   JSON.parse(req.query.where),
            include: [
                fn.inc.stores.location(),
                fn.inc.stores.issue(),
                fn.inc.stores.size()
            ],
            ...fn.sort(req.query.sort)
        })
        .then(serials => res.send({success: true, result: serials}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/current_serials', fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        req.query.location_id = {[fn.op.not]: null};
        req.query.issue_id    = null;
        m.serials.findAll({
            where:   JSON.parse(req.query.where),
            include: [
                fn.inc.stores.location(),
                fn.inc.stores.issue(),
                fn.inc.stores.size()
            ],
            ...fn.sort(req.query.sort)
        })
        .then(serials => res.send({success: true, result: serials}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/serial',          fn.loggedIn(), fn.permissions.check('access_stores'), (req, res) => {
        fn.get(
            'serials',
            JSON.parse(req.query.where),
            [
                fn.inc.stores.location(),
                fn.inc.stores.issue(),
                fn.inc.stores.size()
            ]
        )
        .then(serial => res.send({success: true, result: serial}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/serials',            fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        if (!req.body.location) fn.send_error(res, 'No location entered')
        else {
            fn.get(
                'sizes',
                {size_id: req.body.serial.size_id}
            )
            .then(size => {
                return m.locations.findOrCreate({where: {location: req.body.location}})
                .then(([location, created]) => {
                    return m.serials.findOrCreate({
                        where: {
                            size_id: size.size_id,
                            serial:  req.body.serial.serial
                        },
                        defaults: {
                            location_id: location.location_id
                        }
                    })
                    .then(([serial, created]) => res.send({success: true, message: 'Serial # added'}))
                    .catch(err => fn.send_error(res, err));
                })
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        };
    });
    
    app.put('/serials/:id',         fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.get(
            'serials',
            {serial_id: req.params.id}
        )
        .then(serial => {
            return m.locations.findOrCreate({where: {location: req.body.location}})
            .then(([location, created]) => {
                return fn.update(serial, {
                    serial:      req.body.serial.serial,
                    location_id: location.location_id
                })
                .then(result => res.send({success: true, message: 'Serial saved'}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });

    app.delete('/serials/:id',      fn.loggedIn(), fn.permissions.check('stores_stock_admin'),   (req, res) => {
        fn.get(
            'serials',
            {serial_id: req.params.id}
        )
        .then(serial => {
            return m.actions.findOne({where: {serial_id: serial.serial_id}})
            .then(action => {
                if (action) fn.send_error(res, 'Cannot delete a serial with actions')
                else {
                    return m.loancards.findOne({where: {serial_id: serial.serial_id}})
                    .then(action => {
                        if (action) fn.send_error(res, 'Cannot delete a serial with loancards')
                        else {
                            return serial.destroy()
                            .then(result => res.send({success: true, message: 'Serial deleted'}))
                            .catch(err => fn.send_error(res, err));
                        };
                    })
                    .catch(err => fn.send_error(res, err));
                };
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};