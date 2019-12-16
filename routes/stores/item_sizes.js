const   fn = {},
        mw = {},
        op = require('sequelize').Op;

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    // New Form
    app.get('/stores/item_sizes/new', mw.isLoggedIn, allowed('item_size_add', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.items,
            {item_id: req.query.item_id}
            )
            .then(item => {
            fn.getAllWhere(
                m.suppliers,
                {supplier_id: {[op.not]: 3}}
            )
            .then(suppliers => {
                fn.getAll(
                    m.sizes
                )
                .then(sizes => {
                    res.render('stores/item_sizes/new', {
                        item:     item,
                        sizes:    sizes,
                        suppliers: suppliers
                    });
                })
                .catch(err => {
                    fn.error(err, '/stores/items', req, res);
                });
            })
            .catch(err => {
                fn.error(err, '/stores', req, res);
            });
        })
        .catch(err => {
            fn.error(err, '/stores/items', req, res);
        });
    });

    // New Logic
    app.post('/stores/item_sizes', mw.isLoggedIn, allowed('item_size_add', true, fn.getOne, m.permissions), (req, res) => {
        if (req.body.sizes) {
            var lines = [];
            req.body.sizes.map(size_id => {
                if (size_id) {
                    lines.push(fn.addSize(size_id, req.body.details.item_id))
                };
            });
            if (lines.length > 0) {
                Promise.all(lines)
                .then(results => {
                    res.redirect('/stores/items/' + req.body.details.item_id);
                }).catch((err) => {
                    fn.error(err, '/stores/items/' + req.body.details.item_id, req, res);
                });
            } else {
                res.redirect('/stores/items/' + req.body.details.item_id)
            };
        } else {
            req.flash('info', 'No sizes selected!');
            res.redirect('/stores/items/' + req.body.details.item_id);
        };
    });
    
    // Edit
    app.get('/stores/item_sizes/:id/edit', mw.isLoggedIn, allowed('item_edit', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.item_sizes,
            {itemsize_id: req.params.id},
            fn.itemSizeInclude({include: false}, {include: false}, {include: false}, {include: false}, {include: false})
        )
        .then(item_size => {
            fn.getAll(
                m.suppliers,
            )
            .then(suppliers => {
                res.render('stores/item_sizes/edit', {
                    item_size:  item_size,
                    suppliers: suppliers
                });
            })
            .catch(err => {
                fn.error(err, '/stores/item_sizes/' + req.params.id, req, res);
            });
        })
        .catch(err => {
            fn.error(err, 'stores/item_sizes/' + req.params.id, req, res)
        });
    });
    
    // Put
    app.put('/stores/item_sizes/:id', mw.isLoggedIn, allowed('item_edit', true, fn.getOne, m.permissions), (req, res) => {
        if (typeof(req.body.item_size._orderable) === 'undefined') {
            req.body.item_size._orderable = 0;
        } else {
            req.body.item_size._orderable = 1
        };
        fn.update(
            m.item_sizes,
            req.body.item_size,
            {itemsize_id: req.params.id}
        )
        .then(result => {
            res.redirect('/stores/item_sizes/' + req.params.id);  
        })
        .catch(err => {
            fn.error(err, '/stores/item_sizes/' + req.params.id, req, res);
        });
    });

    // Delete
    app.delete('/stores/item_sizes/:id', mw.isLoggedIn, allowed('item_size_delete', true, fn.getOne, m.permissions), (req, res) => {
        if (req.query.item_id) {
            fn.getOne(
                m.stock,
                {itemsize_id: req.params.id}
                )
                .then(stock => {
                if (stock === null) {
                    fn.getOne(
                        m.nsns,
                        {itemsize_id: req.params.id}
                    )
                    .then(nsn => {
                        if (nsn === null) {
                            fn.delete(
                                m.item_sizes,
                                {itemsize_id: req.params.id}
                            )
                            .then(result => {
                                req.flash('success', 'Item size deleted');
                                res.redirect('/stores/items/' + req.query.item_id);
                            })
                            .catch(err => {
                                fn.error(err, '/stores/item_sizes/' + req.params.id, req, res);
                            });
                        } else {
                            req.flash('danger', 'Cannot delete a size whilst it has NSNs assigned');
                            res.redirect('/stores/item_sizes/' + req.params.id);
                        };
                    })
                    .catch(err => {
                        fn.error(err, '/stores/item_sizes/' + req.params.id, req, res);
                    });
                } else {
                    req.flash('danger', 'Cannot delete a size whilst it has stock');
                    res.redirect('/stores/item_sizes/' + req.params.id);
                };
            })
            .catch(err => {
                fn.error(err, ''/stores/item_sizes/' + req.params.id', req, res);
            });
        };
    });

    // Show
    app.get('/stores/item_sizes/:id', mw.isLoggedIn, allowed('access_items', true, fn.getOne, m.permissions), (req, res) => {
        var query = {};
        query.sn = req.query.sn || 2;
        fn.getOne(
            m.item_sizes,
            {itemsize_id: req.params.id},
            fn.itemSizeInclude(
                {include: true}, 
                {include: true}, 
                {include: true, where: {return_line_id: null}},
                {include: true, where: {receipt_line_id: null}},
                {include: true, where: {_status: 'Pending'}}
            )
        )
        .then(item_size => {
            fn.getNotes('item_sizes', req.params.id, req, res)
            .then(notes =>{
                var stock = new Object();
                stock._stock     = fn.summer(item_size.stocks) || 0;
                stock._ordered   = fn.summer(item_size.orders_ls) || 0;
                stock._issued    = fn.summer(item_size.issues_ls) || 0;
                stock._requested = fn.summer(item_size.requests_ls) || 0;
                res.render('stores/item_sizes/show', {
                    item_size:  item_size,
                    notes: notes,
                    stock: stock,
                    query: query
                });
            });
        })
        .catch(err => {
            fn.error(err, '/stores/items', req, res);
        });
    });
};