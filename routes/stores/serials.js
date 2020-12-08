module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/stores/serials/new',      permissions, allowed('serial_add'),                   (req, res) => {
        m.sizes.findOne({
            where: {size_id: req.query.size_id},
            include: [m.items]
        })
        .then(size => res.render('stores/serials/new', {size: size}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/serials/:id',      permissions, allowed('access_serials'),               (req, res) => res.render('stores/serials/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/serials/:id/edit', permissions, allowed('serial_edit'),                  (req, res) => res.render('stores/serials/edit'));

    app.get('/stores/get/serials',      permissions, allowed('access_serials', {send: true}), (req, res) => {
        m.serials.findAll({
            where:   req.query,
            include: [inc.locations({as: 'location'})]
        })
        .then(serials => res.send({result: true, serials: serials}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/serials',         permissions, allowed('serial_add',     {send: true}), (req, res) => {
        m.locations.findOrCreate({where: {_location: req.body._location}})
        .then(([location, created]) => {
            m.serials.create({...req.body.serial, ...{location_id: location.location_id}})
            .then(serial => res.send({result: true, message: 'Serial saved'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res))
    });
    
    app.put('/stores/serials/:id',      permissions, allowed('serial_edit',    {send: true}), (req, res) => {
        m.locations.findOrCreate({where: {_location: req.body._location}})
        .then(([location, created]) => {
            m.serials.update(
                {...req.body.serial, ...{location_id: location.location_id}},
                {where: {serial_id: req.params.id}}
            )
            .then(result => res.send({result: true, message: 'Serial saved'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res))
    });

    app.delete('/stores/serials/:id',   permissions, allowed('serial_delete',  {send: true}), (req, res) => { //////
        m.serials.destroy({where: {serial_id: req.params.id}})
        .then(result => res.send({result: true, message: 'Serial deleted'}))
        .catch(err => res.error.send(err, res));
    });
};