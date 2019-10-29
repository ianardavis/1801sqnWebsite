const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Form
    app.get('/stores/items_sizes/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_size_add', res, (allowed) => {
            if (allowed) {
                fn.getOne(m.items, req, res, {item_id: req.query.item_id}, (item) => {
                    fn.getAll(m.sizes, req, res, true, (sizes) => {
                        res.render('stores/items_sizes/new', {
                            item:   item,
                            sizes:  sizes
                        });
                    });
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items/' + req.query.item_id);
            }
        });   
    })

    // New Logic
    app.post('/stores/items_sizes', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_size_add', res, (allowed) => {
            if (allowed) {
                if (req.body.details.sizes) {
                    var newsizes = new Array();
                    if (typeof(req.body.details.sizes) === 'string') {
                        newsizes.push(req.body.details.sizes);
                    } else {
                        newsizes = req.body.details.sizes;
                    }
                    newsizes.forEach((size) => {
                        m.items_sizes.findOne({
                            where: {
                                item_id: req.body.details.item_id,
                                size_id: size
                            }
                        }).then((result) => {
                            if ((!result)) {
                                var itemSize = req.body.details;
                                itemSize.size_id = size;
                                m.items_sizes.create(itemSize).then((newSize) => {});
                            } else {
                                req.flash('danger', 'A requested size is already assigned!')
                            }
                        }).catch((err) => {
                            req.flash('danger', 'Error checking for existing size!');
                            console.log(err);
                            res.redirect('/stores/items/' + req.body.details.item_id);
                        });
                    });
                    req.flash('success', 'Sizes added!');
                    res.redirect('/stores/items/' + req.body.details.item_id);
                } else {
                    req.flash('info', 'No sizes selected!');
                    res.redirect('/stores/items/' + req.body.details.item_id);
                }
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items/' + req.query.item_id);
            }
        }); 
    })
    
    // Edit
    app.get('/stores/items_sizes/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_edit', res, (allowed) => {
            if (allowed) {
                m.items_sizes.findOne({
                    where: {stock_id: req.params.id},
                    include: [m.items, m.sizes]
                }).then((details) => {
                    if (!details) {
                        req.flash('danger', 'Error retrieving Item!');
                        res.render('stores/items');
                    } else {
                        res.render('stores/items_sizes/edit', {
                            details: details
                        });
                    }
                }).catch((err) => {
                    req.flash('Error finding size')
                    console.log(err);
                    res.redirect('/stores/items');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items');
            }
        });
    });
    
    // Put
    app.put('/stores/items_sizes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('items_edit', res, (allowed) => {
            if (allowed) {
                if (typeof(req.body.details._orderable) === 'undefined') {
                    req.body.details._orderable = 0;
                } else {
                    req.body.details._orderable = 1
                };
                m.items_sizes.update(
                    req.body.details,
                    {
                        where: {stock_id: req.params.id}
                    }
                ).then((item) => {
                    if (item) {
                        req.flash('success', 'Item edited!');
                        res.redirect('/stores/items_sizes/' + req.params.id)
                    } else {
                        req.flash('danger', 'Details not edited!');
                        res.redirect('/stores/items_sizes/' + req.params.id);  
                    }
                }).catch((err) => {
                    req.flash('danger', 'Error editing details!');
                    console.log(err);
                    res.redirect('/stores/items_sizes/' + req.params.id);            
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/items_sizes/' + req.params.id);
            }
        });
    });

    // Delete
    app.delete('/stores/items_sizes/:id', mw.isLoggedIn, (req, res) => {
        if (req.query.item_id) {
            fn.allowed('items_size_delete', res, (allowed) => {
                fn.getOne(m.items_locations, req, res, {stock_id: req.params.id}, (location) => {
                    if (location === null) {
                        fn.getOne(m.items_nsns, req, res, {stock_id: req.params.id}, (nsn_exists) => {
                            if (nsn_exists === null) {
                                fn.delete(allowed, m.items_sizes, {stock_id: req.params.id}, req, (result) => {
                                    res.redirect('/stores/items/' + req.query.item_id);
                                });
                            } else {
                                req.flash('danger', 'Cannot delete a size whilst it has NSNs assigned!');
                                res.redirect('/stores/items_sizes/' + req.params.id);
                            };
                        });
                    } else {
                        req.flash('danger', 'Cannot delete a size whilst it has locations assigned!');
                        res.redirect('/stores/items_sizes/' + req.params.id);
                    };
                });
            });
        };
    });

    // Show
    app.get('/stores/items_sizes/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_items', res, (allowed) => {
            if (allowed) {
                m.items_sizes.findOne({
                    where: {
                        stock_id: req.params.id
                    },
                    include: [
                        m.items,
                        m.sizes,
                        m.issues,
                        m.orders,
                        {
                            model: m.items_locations,
                            as: 'locations'
                        },{
                            model: m.items_nsns,
                            as: 'nsns'
                        }
                    ]
                }).then((item_size) => {
                    if (!item_size) {
                        req.flash('danger', 'Size not found!');
                        res.redirect('/stores/items');
                    } else {
                        fn.getAllWhere(m.orders, {stock_id: item_size.stock_id, receipt_id: null}, req, res, (orders) => {
                            item_size.orders = orders;
                            fn.getAllWhere(m.issues, {stock_id: item_size.stock_id, returned_to: null}, req, res, (orders) => {
                                item_size.issues = orders;
                                fn.getNotes('items_sizes', req.params.id, req, (notes) =>{
                                    var stock = new Object();
                                    stock._stock = summer(item_size.locations);
                                    stock._ordered = summer(item_size.orders);
                                    stock._issued = summer(item_size.issues);
                                    res.render('stores/items_sizes/show', {
                                        item:   item_size,
                                        notes:  notes,
                                        stock:  stock
                                    });
                                });
                            });
                        });
                    };
                }).catch((err) => {
                    req.flash('danger', 'Error finding size');
                    console.log(err);
                    res.redirect('/stores/items');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores');
            }
        });
    });
}

function summer(items) {
    if (items == null) {
        return 0;
    }
    return items.reduce((a, b) => {
        return b['_qty'] == null ? a : a + b['_qty'];
    }, 0);
};