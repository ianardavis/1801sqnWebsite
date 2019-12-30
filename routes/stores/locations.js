module.exports = (app, m, allowed, fn, isLoggedIn) => {
    // New Logic
    app.post('/stores/locations', isLoggedIn, allowed('locations_add'), (req, res) => {
        fn.create(
            m.locations,
            req.body.location
        )
        .then(location => res.redirect('/stores/item_sizes/' + location.stock_id))
        .catch(err => fn.error(err, '/stores/items', req, res));
    });

    // New Form
    app.get('/stores/locations/new', isLoggedIn, allowed('locations_add'), (req, res) => {
        fn.getOne(
            m.item_sizes,
            {itemsize_id: req.query.itemsize_id},
            fn.item_sizes()
        )
        .then(item_size => res.render('stores/locations/new', {item_size: item_size}))
        .catch(err => fn.error(err, '/stores/item_sizes', req, res));
    });

    // Edit
    app.get('/stores/locations/:id/edit', isLoggedIn, allowed('locations_edit'), (req, res) => {
        fn.getLocation(req.params.id, req, location => {
            if (location) {
                fn.getNotes('locations', req.params.id, req)
                .then(notes => {
                    res.render('stores/locations/edit', {
                        location: location,
                        notes:    notes,
                        query:    {sn: req.query.sn || 2}
                    });
                });
            } else res.redirect('/stores/items');
        });
    });

    // Put
    app.put('/stores/locations/:id', isLoggedIn, allowed('locations_edit'), (req, res) => {
        fn.update(
            m.locations,
            req.body.location,
            {location_id: req.params.id}
        )
        .then(result => res.redirect('back'))
        .catch(err => fn.error(err, 'back', req, res));
    });

    // Delete
    app.delete('/stores/locations/:id', isLoggedIn, allowed('locations_delete'), (req, res) => {
        fn.getOne(
            m.locations,
            {location_id: req.params.id}
        )
        .then(location => {
            if (location._qty === 0) {
                fn.delete(
                    'locations',
                    {location_id: req.params.id}
                )
                .then(result => {
                    req.flash('success', 'Location deleted')
                    res.redirect('/stores/item_sizes/' + location.stock_id)
                })
                .catch(err => fn.error(err, '/stores/item_sizes/' + location.stock_id, req, res));
            } else {
                req.flash('danger', 'Cannot delete a location with stock in!');
                res.redirect('/stores/item_sizes/' + location.stock_id);
            };
        })
        .catch(err => fn.error(err, 'back', req, res));
    });
}