const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Form
    app.get('/stores/item_sizes/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_size_add', true, req, res, (allowed) => {
            fn.getOne(m.items, {item_id: req.query.item_id}, req, (item) => {
                fn.getAllSuppliers(req, (suppliers) => {
                    fn.getAll(m.sizes, req, true, (sizes) => {
                        res.render('stores/item_sizes/new', {
                            item:     item,
                            sizes:    sizes,
                            suppliers: suppliers
                        });
                    });
                });
            });
        });   
    });

    // New Logic
    app.post('/stores/item_sizes', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_size_add', true, req, res, (allowed) => {
            if (req.body.details.sizes) {
                var newsizes = new Array();
                if (typeof(req.body.details.sizes) === 'string') {
                    newsizes.push(req.body.details.sizes);
                } else {
                    newsizes = req.body.details.sizes;
                };
                var lines = [];
                newSizes.map((size_id) => {
                    if (size_id) {
                        lines.push(fn.addSize(size_id, req))
                    };
                });
                if (lines.length > 0) {
                    Promise.all(lines)
                    .then(() => {
                        fn.processPromiseResult(results, req, (then) => {
                            res.redirect('/stores/items/' + req.body.details.item_id);
                        })
                    }).catch((err) => {
                        console.log(err);
                        res.redirect('/stores/items/' + req.body.details.item_id)
                    });
                } else {
                    res.redirect('/stores/items/' + req.body.details.item_id)
                };
            } else {
                req.flash('info', 'No sizes selected!');
                res.redirect('/stores/items/' + req.body.details.item_id);
            }
        }); 
    })
    
    // Edit
    app.get('/stores/item_sizes/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_edit', true, req, res, (allowed) => {
            fn.getItemSize(req.params.id, req, false, false, false, false, (size) => {
                fn.getAllSuppliers(req, (suppliers) => {
                    if (size) {
                        res.render('stores/item_sizes/edit', {
                            size:      size,
                            suppliers: suppliers
                        });
                    } else {
                        req.flash('danger', 'Error retrieving Item!');
                        res.render('stores/item_sizes/' + req.params.id);
                    };
                });
            });
        });
    });
    
    // Put
    app.put('/stores/item_sizes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('item_edit', true, req, res, (allowed) => {
            if (typeof(req.body.item_size._orderable) === 'undefined') {
                req.body.item_size._orderable = 0;
            } else {
                req.body.item_size._orderable = 1
            };
            fn.update(m.item_sizes, req.body.item_size, {stock_id: req.params.id}, req, (result) => {
                res.redirect('/stores/item_sizes/' + req.params.id);  
            });
        });
    });

    // Delete
    app.delete('/stores/item_sizes/:id', mw.isLoggedIn, (req, res) => {
        if (req.query.item_id) {
            fn.allowed('item_size_delete', true, req, res, (allowed) => {
                fn.getOne(m.item_locations, {stock_id: req.params.id}, req, (location) => {
                    if (location === null) {
                        fn.getOne(m.item_nsns, {stock_id: req.params.id}, req, (nsn_exists) => {
                            if (nsn_exists === null) {
                                fn.delete(m.item_sizes, {stock_id: req.params.id}, req, (result) => {
                                    res.redirect('/stores/items/' + req.query.item_id);
                                });
                            } else {
                                req.flash('danger', 'Cannot delete a size whilst it has NSNs assigned!');
                                res.redirect('/stores/item_sizes/' + req.params.id);
                            };
                        });
                    } else {
                        req.flash('danger', 'Cannot delete a size whilst it has locations assigned!');
                        res.redirect('/stores/item_sizes/' + req.params.id);
                    };
                });
            });
        };
    });

    // Show
    app.get('/stores/item_sizes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', true, req, res, (allowed) => {
            fn.getItemSize(
                req.params.id,
                req, 
                {include: true}, 
                {include: true}, 
                {include: true, where: {stock_id: req.params.id, returned_to: null}},
                {include: true, where: {stock_id: req.params.id, receipt_id: null}}, 
                (item_size) => {
                if (item_size) {
                    fn.getNotes('item_sizes', req.params.id, req, res, (notes) =>{
                        var stock = new Object();
                        stock._stock = fn.summer(item_size.locations);
                        stock._ordered = fn.summer(item_size.orders);
                        stock._issued = fn.summer(item_size.issues);
                        res.render('stores/item_sizes/show', {
                            item:   item_size,
                            notes:  notes,
                            stock:  stock
                        });
                    });
                } else {
                    res.redirect('/stores/items');
                };
            });
        });
    });
};