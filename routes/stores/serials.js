module.exports = (app, al, inc, pm, m) => {
    app.get('/stores/get/serials',    pm, al('access_serials', {send: true}), (req, res) => {
        m.stores.serials.findAll({
            where:   req.query,
            include: [
                inc.locations({as: 'location'}),
                inc.issues()
            ]
        })
        .then(serials => res.send({success: true, result: serials}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/serial',     pm, al('access_serials', {send: true}), (req, res) => {
        m.stores.serials.findOne({
            where:   req.query,
            include: [
                inc.locations({as: 'location'}),
                inc.issues()
            ]
        })
        .then(serial => res.send({success: true, result: serial}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/serials',       pm, al('serial_add',     {send: true}), (req, res) => {
        if (!req.body._location) res.send({success: false, message: 'No location entered'})
        else {
            m.stores.locations.findOrCreate({where: {_location: req.body._location}})
            .then(([location, created]) => {
                return m.stores.serials.create({...req.body.serial, ...{location_id: location.location_id}})
                .then(serial => res.send({success: true, message: 'Serial saved'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        };
    });
    
    app.put('/stores/serials',        pm, al('serial_edit',    {send: true}), (req, res) => {
        if (req.body.serial_id) res.send({success: false, message: 'No serial ID submitted'})
        else {
            m.stores.locations.findOrCreate({where: {_location: req.body._location}})
            .then(([location, created]) => {
                m.stores.serials.update(
                    {...req.body.serial, ...{location_id: location.location_id}},
                    {where: {serial_id: req.body.serial_id}}
                )
                .then(result => res.send({success: true, message: 'Serial saved'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        };
    });

    app.delete('/stores/serials/:id', pm, al('serial_delete',  {send: true}), (req, res) => {
        m.stores.serials.destroy({where: {serial_id: req.params.id}})
        .then(result => res.send({success: true, message: 'Serial deleted'}))
        .catch(err => res.error.send(err, res));
    });
};