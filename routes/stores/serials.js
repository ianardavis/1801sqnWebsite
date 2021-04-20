module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/serials',    li, pm.check('access_serials', {send: true}), (req, res) => {
        m.serials.findAll({
            where:   req.query,
            include: [
                inc.location(),
                inc.issue()
            ]
        })
        .then(serials => res.send({success: true, result: serials}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/serial',     li, pm.check('access_serials', {send: true}), (req, res) => {
        m.serials.findOne({
            where:   req.query,
            include: [
                inc.location(),
                inc.issue()
            ]
        })
        .then(serial => res.send({success: true, result: serial}))
        .catch(err => send_error(res, err));
    });

    app.post('/serials',       li, pm.check('serial_add',     {send: true}), (req, res) => {
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
    
    app.put('/serials',        li, pm.check('serial_edit',    {send: true}), (req, res) => {
        if (req.body.serial_id) send_error(res, 'No serial ID submitted')
        else {
            m.locations.findOrCreate({where: {_location: req.body._location}})
            .then(([location, created]) => {
                m.serials.update(
                    {...req.body.serial, ...{location_id: location.location_id}},
                    {where: {serial_id: req.body.serial_id}}
                )
                .then(result => res.send({success: true, message: 'Serial saved'}))
                .catch(err => send_error(res, err));
            })
            .catch(err => send_error(res, err));
        };
    });

    app.delete('/serials/:id', li, pm.check('serial_delete',  {send: true}), (req, res) => {
        m.serials.destroy({where: {serial_id: req.params.id}})
        .then(result => res.send({success: true, message: 'Serial deleted'}))
        .catch(err => send_error(res, err));
    });
};