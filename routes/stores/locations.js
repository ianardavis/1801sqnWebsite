const   mw = {},
        fn = {};

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    // New Logic
    app.post('/stores/locations', mw.isLoggedIn, allowed('locations_add', true, fn.getOne, m.permissions), (req, res) => {
        fn.create(
            m.locations,
            req.body.location
        )
        .then(location => {
            res.redirect('/stores/item_sizes/' + location.stock_id);
        })
        .catch(err => {
            fn.error(err, '/stores/items', req, res);
        });
    });

    // New Form
    app.get('/stores/locations/new', mw.isLoggedIn, allowed('locations_add', true, fn.getOne, m.permissions), (req, res) => {
        fn.getItemSize(req.query.stock_id, req, {include: false}, {include: false}, {include: false}, {include: false}, {include: false}, (item) => {
            if(item) {
                res.render('stores/locations/new', {
                    item: item,
                });
            } else {
                res.redirect('/stores/item_sizes/' + req.query.stock_id)
            };
        });
    });

    // Edit
    app.get('/stores/locations/:id/edit', mw.isLoggedIn, allowed('locations_edit', true, fn.getOne, m.permissions), (req, res) => {
        var query = {};
        query.sn = req.query.sn || 2;
        fn.getLocation(req.params.id, req, location => {
            if (location) {
                fn.getNotes('locations', req.params.id, req, res, notes => {
                    res.render('stores/locations/edit', {
                        location: location,
                        notes:    notes,
                        query:    query
                    });
                });
            } else {
                res.redirect('/stores/items');
            };
        });
    });

    // Put
    app.put('/stores/locations/:id', mw.isLoggedIn, allowed('locations_edit', true, fn.getOne, m.permissions), (req, res) => {
        fn.update(
            m.locations,
            req.body.location,
            {location_id: req.params.id}
        )
        .then(result => {
            res.redirect('back');
        })
        .catch(err => {
            fn.error(err, 'back', req, res);
        });
    });

    // Delete
    app.delete('/stores/locations/:id', mw.isLoggedIn, allowed('locations_delete', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.locations,
            {location_id: req.params.id}
        )
        .then(location => {
            if (location._qty === 0) {
                fn.delete(
                    m.locations,
                    {location_id: req.params.id}
                )
                .then(result => {
                    res.redirect('/stores/item_sizes/' + location.stock_id);
                })
                .catch(err => {
                    fn.error(err, '/stores/item_sizes/' + location.stock_id, req, res);
                });
            } else {
                req.flash('danger', 'Cannot delete a location with stock in!');
                res.redirect('/stores/item_sizes/' + location.stock_id);
            };
        })
        .catch(err => {
            fn.error(err, 'back', req, res);
        });
    });
}