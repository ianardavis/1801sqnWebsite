module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/serials/new',      isLoggedIn, allowed('serial_add'),                   (req, res) => {
        db.findOne({
            table: m.sizes,
            where: {size_id: req.query.size_id},
            include: [m.items]
        })
        .then(itemsize => res.render('stores/serials/new', {itemsize: itemsize}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/serials/:id',      isLoggedIn, allowed('serial_edit'),                  (req, res) => {
        db.findOne({
            table: m.serials,
            where: {serial_id: req.params.id}
        })
        .then(serial => {
            res.render('stores/serials/show', {
                serial:   serial,
                notes:    {table: 'serials', id: serial.serial_id},
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/serials/:id/edit', isLoggedIn, allowed('serial_edit'),                  (req, res) => {
        db.findOne({
            table: m.serials,
            where: {serial_id: req.params.id},
            include: [inc.sizes()]
        })
        .then(serial => res.render('stores/serials/edit', {serial: serial}))
        .catch(err => res.error.redirect(err, req, res));
    });

    app.get('/stores/get/serials',      isLoggedIn, allowed('access_serials', {send: true}), (req, res) => {
        m.serials.findAll({where: req.query})
        .then(serials => res.send({result: true, serials: serials}))
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/serials',         isLoggedIn, allowed('serial_add',     {send: true}), (req, res) => {
        m.serials.create(req.body.serial)
        .then(serial => res.send({result: true, message: 'Serial added'}))
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/serials/:id',      isLoggedIn, allowed('serial_edit',    {send: true}), (req, res) => {
        db.update({
            table: m.serials,
            where: {serial_id: req.params.id},
            record: req.body.serial
        })
        .then(result => res.send({result: true, message: 'Serial # saved'}))
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/serials/:id',   isLoggedIn, allowed('serial_delete',  {send: true}), (req, res) => {
        db.destroy({
            table: m.serials,
            where: {serial_id: req.params.id}
        })
        .then(result => res.send({result: true, message: 'Serial deleted'}))
        .catch(err => res.error.send(err, res));
    });
};
