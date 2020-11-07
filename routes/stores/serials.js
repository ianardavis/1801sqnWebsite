module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/serials/new',      isLoggedIn, allowed('serial_add'),                  (req, res) => {
        db.findOne({
            table: m.sizes,
            where: {size_id: req.query.size_id},
            include: [m.items]
        })
        .then(size => res.render('stores/serials/new', {size: size}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/serials/:id',      isLoggedIn, allowed('access_serials'),              (req, res) => res.render('stores/serials/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/serials/:id/edit', isLoggedIn, allowed('serial_edit'),                 (req, res) => res.render('stores/serials/edit'));

    app.post('/stores/serials',         isLoggedIn, allowed('serial_add',    {send: true}), (req, res) => {
        m.locations.findOrCreate({where: {_location: req.body._location}})
        .then(([location, created]) => {
            m.serials.create({...req.body.serial, ...{location_id: location.location_id}})
            .then(serial => res.send({result: true, message: 'Serial saved'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res))
    });
    app.put('/stores/serials/:id',      isLoggedIn, allowed('serial_edit',   {send: true}), (req, res) => {
        m.locations.findOrCreate({where: {_location: req.body._location}})
        .then(([location, created]) => {
            db.update({
                table: m.serials,
                where: {serial_id: req.params.id},
                record: {...req.body.serial, ...{location_id: location.location_id}}
            })
            .then(result => res.send({result: true, message: 'Serial saved'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res))
    });

    app.delete('/stores/serials/:id',   isLoggedIn, allowed('serial_delete', {send: true}), (req, res) => { //////
        db.destroy({
            table: m.serials,
            where: {serial_id: req.params.id}
        })
        .then(result => res.send({result: true, message: 'Serial deleted'}))
        .catch(err => res.error.send(err, res));
    });
};