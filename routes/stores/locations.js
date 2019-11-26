const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/locations', mw.isLoggedIn, (req, res) => {
        fn.allowed('locations_add', true, req, res, (allowed) => {
            fn.create(m.locations, req.body.location,req, (location) => {
                if (location) {
                    res.redirect('/stores/item_sizes/' + location.stock_id);
                } else {
                    res.redirect('/stores/items');
                };
            });
        });
    });

    // New Form
    app.get('/stores/locations/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('locations_add', true, req, res, (allowed) => {
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
    });

    // Edit
    app.get('/stores/locations/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('locations_edit', true, req, res, (allowed) => {
            var query = {};
            query.sn = req.query.sn || 2;
            fn.getLocation(req.params.id, req, (location) => {
                if (location) {
                    fn.getNotes('locations', req.params.id, req, res, (notes) => {
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
    });

    // Put
    app.put('/stores/locations/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('locations_edit', true, req, res, (allowed) => {
            fn.update(m.locations, req.body.location, {location_id: req.params.id},req, (result) => {
                res.redirect('back'); 
            });
        });
    });

    // Delete
    app.delete('/stores/locations/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('locations_delete', true, req, res, (allowed) => {
            fn.getOne(m.locations, {location_id: req.params.id}, req, (location) => {
                if (location._qty === 0) {
                    fn.delete(m.locations, {location_id: req.params.id}, req, (result) => {
                        res.redirect('/stores/item_sizes/' + location.stock_id);
                    });
                } else {
                    req.flash('danger', 'Cannot delete a location with stock in!');
                    res.redirect('/stores/item_sizes/' + location.stock_id);
                };
            });
        });
    });
}