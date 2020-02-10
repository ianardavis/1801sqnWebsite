module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // New Logic
    app.post('/stores/serials', isLoggedIn, allowed('serials_add'), (req, res) => {
        fn.create(
            m.serials,
            req.body.serial
        )
        .then(serial => {
            req.flash('success', 'Serial added')
            res.redirect('/stores/item_sizes/' + serial.itemsize_id);
        })
        .catch(err => fn.error(err, '/stores/item_sizes/' + req.body.serial.itemsize_id, req, res));
    });

    // New Form
    app.get('/stores/serials/new', isLoggedIn, allowed('serials_add'), (req, res) => {
        fn.getOne(
            m.item_sizes,
            {itemsize_id: req.query.itemsize_id},
            {include: fn.itemSize_inc()}
        )
        .then(itemsize => res.render('stores/serials/new', {itemsize: itemsize}))
        .catch(err => fn.error(err, '/stores/item_sizes/' + req.query.itemsize_id, req, res));
    });

    // Edit
    app.get('/stores/serials/:id/edit', isLoggedIn, allowed('serials_edit'), (req, res) => {
        fn.getOne(
            m.serials,
            {serial_id: req.params.id},
            {include: [{model: m.item_sizes, include: [m.items]}]}
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
    app.put('/stores/serials/:id', isLoggedIn, allowed('serials_edit'), (req, res) => {
        fn.update(
            m.serials,
            req.body.serial,
            {serial_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Serial updated');
            res.redirect('/stores/item_sizes/' + serial.itemsize_id);
        })
        .catch(err => fn.error(err, '/stores/item_sizes/' + serial.itemsize_id, req, res));
    });
    // Delete
    app.delete('/stores/serials/:id', isLoggedIn, allowed('serials_delete'), (req, res) => {
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
