module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/serials/:id',         li, pm.get('access_serials'),   (req, res) => res.render('stores/serials/show'));
    app.get('/get/serials',         li, pm.check('access_serials'), (req, res) => {
        m.serials.findAll({
            where:   req.query,
            include: [
                inc.location(),
                inc.issue(),
                inc.size()
            ]
        })
        .then(serials => res.send({success: true, result: serials}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/current_serials', li, pm.check('access_serials'), (req, res) => {
        req.query.location_id = {[op.not]: null};
        req.query.issue_id    = null;
        m.serials.findAll({
            where:   req.query,
            include: [
                inc.location(),
                inc.issue(),
                inc.size()
            ]
        })
        .then(serials => res.send({success: true, result: serials}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/serial',          li, pm.check('access_serials'), (req, res) => {
        m.serials.findOne({
            where:   req.query,
            include: [
                inc.location(),
                inc.issue(),
                inc.size()
            ]
        })
        .then(serial => res.send({success: true, result: serial}))
        .catch(err => send_error(res, err));
    });

    app.post('/serials',            li, pm.check('serial_add'),     (req, res) => {
        if (!req.body.location) send_error(res, 'No location entered')
        else {
            m.sizes.findOne({
                where: {size_id: req.body.serial.size_id},
                attributes: ['size_id']
            })
            .then(size => {
                if (!size) send_error(res, 'Size not found')
                else {
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
                        .catch(err => send_error(res, err));
                    })
                    .catch(err => send_error(res, err));
                };
            })
            .catch(err => send_error(res, err));
        };
    });
    
    app.put('/serials/:id',         li, pm.check('serial_edit'),    (req, res) => {
        m.serials.findOne({where: {serial_id: req.params.id}})
        .then(serial => {
            if (serial) send_error(res, 'Serial not found')
            else {
                m.locations.findOrCreate({where: {location: req.body.location}})
                .then(([location, created]) => {
                    m.serials.update({
                        serial:      req.body.serial.serial,
                        location_id: location.location_id
                    })
                    .then(result => res.send({success: true, message: 'Serial saved'}))
                    .catch(err => send_error(res, err));
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });

    app.delete('/serials/:id',      li, pm.check('serial_delete'),  (req, res) => {
        m.serials.findOne({where: {serial_id: req.params.id}})
        .then(serial => {
            if (!serial) send_error(res, 'Serial not found')
            else {
                return m.actions.findOne({where: {serial_id: serial.serial_id}})
                .then(action => {
                    if (action) send_error(res, 'Cannot delete a serial with actions')
                    else {
                        return m.loancards.findOne({where: {serial_id: serial.serial_id}})
                        .then(action => {
                            if (action) send_error(res, 'Cannot delete a serial with loancards')
                            else {
                                return serial.destroy()
                                .then(result => res.send({success: true, message: 'Serial deleted'}))
                                .catch(err => send_error(res, err));
                            };
                        })
                        .catch(err => send_error(res, err));
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};