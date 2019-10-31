const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/item_locations', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_locations_add', true, req, res, (allowed) => {
            fn.create(m.item_locations, req.body.location,req, (location) => {
                if (location) {
                    res.redirect('/stores/item_sizes/' + location.stock_id);
                } else {
                    res.redirect('/stores/items');
                };
            });
        });
    });

    // New Form
    app.get('/stores/item_locations/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_locations_add', true, req, res, (allowed) => {
            fn.getItemSize(req.query.stock_id, req, false, false, false, false, (item) => {
                if(item) {
                    res.render('stores/item_locations/new', {
                        item: item,
                    });
                } else {
                    res.redirect('/stores/item_sizes/' + req.query.stock_id)
                };
            });
        });
    });

    // Edit
    app.get('/stores/item_locations/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_locations_edit', true, req, res, (allowed) => {
            fn.getLocation(req.params.id, req, (location) => {
                if (location) {
                    fn.getNotes('item_locations', req.params.id, req, (notes) => {
                        res.render('stores/item_locations/edit', {
                            location: location,
                            notes:    notes
                        });
                    });
                } else {
                    res.redirect('/stores/items');
                };
            });
        });
    });

    // Put
    app.put('/stores/item_locations/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_locations_edit', true, req, res, (allowed) => {
            fn.update(m.item_locations, req.body.location, {location_id: req.params.id},req, (result) => {
                res.redirect('back'); 
            });
        });
    });

    // Delete
    app.delete('/stores/item_locations/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_locations_delete', true, req, res, (allowed) => {
            fn.getOne(m.item_locations, {location_id: req.params.id}, req, (location) => {
                if (location._qty === 0) {
                    fn.delete(m.item_locations, {location_id: req.params.id}, req, (result) => {
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