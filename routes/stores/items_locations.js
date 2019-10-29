const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/items_locations', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_locations_add', res, (allowed) => {
            if (allowed) {
                m.items_locations.create(req.body.location
                ).then((location) => {
                    req.flash('success', 'Location added!');
                    res.redirect('/stores/items_sizes/' + location.stock_id);
                }).catch((err) => {
                    req.flash('danger', 'Error adding new item!');
                    console.log(err);
                    res.redirect('/stores/items');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items');
            }
        });
    });

    // New Form
    app.get('/stores/items_locations/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_locations_add', res, (allowed) => {
            if (allowed) {
                m.items_sizes.findOne({
                    where: {stock_id: req.query.stock_id},
                    include: [m.items, m.sizes]
                }).then((item) => {
                    res.render('stores/items_locations/new', {
                        item: item,
                    });
                }).catch((err) => {
                    req.flash('danger', 'Error finding item!')
                    console.log(err);
                    res.redirect('/stores/items_sizes/' + req.query.stock_id);
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items_sizes/' + req.query.stock_id);
            }
        });
    });

    // Edit
    app.get('/stores/items_locations/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_locations_edit', res, (allowed) => {
            if (allowed) {
                m.items_locations.findOne({
                    where: {location_id: req.params.id},
                    include: [
                        {
                            model: m.items_sizes, 
                            as: 'size',
                            include:
                            [
                                m.items, m.sizes
                            ]
                        }
                    ]
                }).then((location) => {
                    fn.getNotes('items_locations', req.params.id, req, (notes) => {
                        res.render('stores/items_locations/edit', {
                            location:   location,
                            notes:      notes
                        });
                    });
                }).catch((err) => {
                    req.flash('danger', 'Error finding location!');
                    console.log(err);
                    res.redirect('/stores/items');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('back');
            }
        });
    });

    // Put
    app.put('/stores/items_locations/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_locations_edit', res, (allowed) => {
            if (allowed) {
                m.items_locations.update(
                    req.body.location
                    ,{
                        where: {location_id: req.params.id}
                    }
                ).then((item) => {
                    req.flash('success', 'Location edited');
                    res.redirect('/stores/items_sizes/' + item.stock_id)
                }).catch((err) => {
                    req.flash('danger', 'Error editing location!');
                    console.log(err);
                    res.redirect('back');            
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('back');
            }
        });
    });

    // Delete
    app.delete('/stores/items_locations/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_locations_delete', res, (allowed) => {
            fn.getOne(m.items_locations, req, res, {location_id: req.params.id}, (location) => {
                if (location._qty === 0) {
                    fn.delete(allowed, m.items_locations, {location_id: req.params.id}, req, (result) => {
                        res.redirect('/stores/items_sizes/' + location.stock_id);
                    });
                } else {
                    req.flash('danger', 'Cannot delete a location with stock in!');
                    res.redirect('/stores/items_sizes/' + location.stock_id);
                };
            });
        });
    });
}