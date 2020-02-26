module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    // New Form
    app.get('/stores/serials/new', isLoggedIn, allowed('serial_add'), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.query.size_id},
            {include: [m.items]}
        )
        .then(itemsize => res.render('stores/serials/new', {itemsize: itemsize}))
        .catch(err => fn.error(err, '/stores/sizes/' + req.query.size_id, req, res));
    });
    // New Logic
    app.post('/stores/serials', isLoggedIn, allowed('serial_add'), (req, res) => {
        fn.create(
            m.serials,
            req.body.serial
        )
        .then(serial => {
            req.flash('success', 'Serial added')
            res.redirect('/stores/sizes/' + serial.size_id);
        })
        .catch(err => fn.error(err, '/stores/sizes/' + req.body.serial.size_id, req, res));
    });

    // Edit
    app.get('/stores/serials/:id/edit', isLoggedIn, allowed('serial_edit'), (req, res) => {
        fn.getOne(
            m.serials,
            {serial_id: req.params.id},
            {include: [inc.sizes()]}
        )
        .then(serial => {
            fn.getNotes('serials', req.params.id, req)
            .then(notes => {
                res.render('stores/serials/edit', {
                    serial: serial,
                    notes:  notes,
                    query:  {system: req.query.system || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    // Put
    app.put('/stores/serials/:id', isLoggedIn, allowed('serial_edit'), (req, res) => {
        fn.update(
            m.serials,
            req.body.serial,
            {serial_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Serial updated');
            res.redirect('/stores/sizes/' + serial.size_id);
        })
        .catch(err => fn.error(err, '/stores/sizes/' + serial.size_id, req, res));
    });
    // Delete
    app.delete('/stores/serials/:id', isLoggedIn, allowed('serial_delete'), (req, res) => {
        fn.delete(
            'serials', 
            {serial_id: req.params.id}
        )
        .then(result => {
            req.flash('info', 'Serial deleted')
            res.redirect('back');
        })
        .catch(err => fn.error(err, 'back', req, res));
    });
};
