module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/serials',    pm.check('access_serials', {send: true}), (req, res) => {
        m.serials.findAll({
            where:   req.query,
            include: [
                inc.locations({as: 'location'}),
                inc.issues()
            ]
        })
        .then(serials => res.send({success: true, result: serials}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/serial',     pm.check('access_serials', {send: true}), (req, res) => {
        m.serials.findOne({
            where:   req.query,
            include: [
                inc.locations({as: 'location'}),
                inc.issues()
            ]
        })
        .then(serial => res.send({success: true, result: serial}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/serials',       pm.check('serial_add',     {send: true}), (req, res) => {
        if (!req.body._location) res.send({success: false, message: 'No location entered'})
        else {
            m.locations.findOrCreate({where: {_location: req.body._location}})
            .then(([location, created]) => {
                return m.serials.create({...req.body.serial, ...{location_id: location.location_id}})
                .then(serial => res.send({success: true, message: 'Serial saved'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        };
    });
    
    app.put('/serials',        pm.check('serial_edit',    {send: true}), (req, res) => {
        if (req.body.serial_id) res.send({success: false, message: 'No serial ID submitted'})
        else {
            m.locations.findOrCreate({where: {_location: req.body._location}})
            .then(([location, created]) => {
                m.serials.update(
                    {...req.body.serial, ...{location_id: location.location_id}},
                    {where: {serial_id: req.body.serial_id}}
                )
                .then(result => res.send({success: true, message: 'Serial saved'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        };
    });

    app.delete('/serials/:id', pm.check('serial_delete',  {send: true}), (req, res) => {
        m.serials.destroy({where: {serial_id: req.params.id}})
        .then(result => res.send({success: true, message: 'Serial deleted'}))
        .catch(err => res.error.send(err, res));
    });
};