module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/stores/get/serials',    permissions, allowed('access_serials', {send: true}), (req, res) => {
        m.stores.serials.findAll({
            where:   req.query,
            include: [inc.locations({as: 'location'})]
        })
        .then(serials => res.send({result: true, serials: serials}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/serial',     permissions, allowed('access_serials', {send: true}), (req, res) => {
        m.stores.serials.findOne({
            where:   req.query,
            include: [inc.locations({as: 'location'})]
        })
        .then(serial => res.send({result: true, serial: serial}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/serials',       permissions, allowed('serial_add',     {send: true}), (req, res) => {
        if (!req.body._location) res.send({result: false, message: 'No location entered'})
        else {
            m.stores.locations.findOrCreate({where: {_location: req.body._location}})
            .then(([location, created]) => {
                return m.stores.serials.create({...req.body.serial, ...{location_id: location.location_id}})
                .then(serial => res.send({result: true, message: 'Serial saved'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        };
    });
    
    app.put('/stores/serials/:id',    permissions, allowed('serial_edit',    {send: true}), (req, res) => {
        m.stores.locations.findOrCreate({where: {_location: req.body._location}})
        .then(([location, created]) => {
            m.stores.serials.update(
                {...req.body.serial, ...{location_id: location.location_id}},
                {where: {serial_id: req.params.id}}
            )
            .then(result => res.send({result: true, message: 'Serial saved'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res))
    });

    app.delete('/stores/serials/:id', permissions, allowed('serial_delete',  {send: true}), (req, res) => {
        m.stores.serials.destroy({where: {serial_id: req.params.id}})
        .then(result => res.send({result: true, message: 'Serial deleted'}))
        .catch(err => res.error.send(err, res));
    });
};