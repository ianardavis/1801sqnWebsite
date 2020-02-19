const op = require('sequelize').Op;
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // New Form
    app.get('/stores/item_sizes/new', isLoggedIn, allowed('item_sizes_add'), (req, res) => {
        fn.getOne(m.items, {item_id: req.query.item_id})
        .then(item => {
            fn.getAll(m.suppliers)
            .then(suppliers => {
                res.render('stores/item_sizes/new', {
                    item:      item,
                    suppliers: suppliers
                });
            })
            .catch(err => fn.error(err, '/stores/items', req, res));
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });

    // New Logic
    app.post('/stores/item_sizes', isLoggedIn, allowed('item_sizes_add'), (req, res) => {
        if (req.body.sizes) {
            let lines = [];
            req.body.sizes.forEach(size => {
                if (size !== '') lines.push(fn.addSize(size, req.body.details));
            });
            if (lines.length > 0) {
                Promise.allSettled(lines)
                .then(results => {
                    console.log(results);
                    results.forEach(result => {
                        if (result.value.result) req.flash('success', 'Size added: ' + result.value.size);
                        else {
                            req.flash('danger', result.value.size + ' not added: ' + result.value.error);
                            console.log(result.value.error);
                        };
                    });
                    res.redirect('/stores/items/' + req.body.details.item_id);
                }).catch((err) => fn.error(err, '/stores/items/' + req.body.details.item_id, req, res));
            } else res.redirect('/stores/items/' + req.body.details.item_id);
        } else {
            req.flash('info', 'No sizes selected!');
            res.redirect('/stores/items/' + req.body.details.item_id);
        };
    });
    
    // Edit
    app.get('/stores/item_sizes/:id/edit', isLoggedIn, allowed('item_sizes_edit'), (req, res) => {
        fn.getOne(
            m.item_sizes,
            {item_size_id: req.params.id},
            {
                include: fn.itemSize_inc({supplier: true})
            }
        )
        .then(item_size => {
            fn.getAll(m.suppliers)
            .then(suppliers => {
                res.render('stores/item_sizes/edit', {
                    item_size:  item_size,
                    suppliers: suppliers
                });
            })
            .catch(err => fn.error(err, '/stores/item_sizes/' + req.params.id, req, res));
        })
        .catch(err => fn.error(err, 'stores/item_sizes/' + req.params.id, req, res));
    });
    
    // Put
    app.put('/stores/item_sizes/:id', isLoggedIn, allowed('item_sizes_edit'), (req, res) => {
        ['_issueable', '_orderable', '_serials', '_nsns'].forEach(checkbox => {
            if (typeof(req.body.item_size[checkbox]) === 'undefined') req.body.item_size[checkbox] = 0
            else req.body.item_size[checkbox] = 1;
        });        
        fn.update(
            m.item_sizes,
            req.body.item_size,
            {item_size_id: req.params.id}
        )
        .then(result => res.redirect('/stores/item_sizes/' + req.params.id))
        .catch(err => fn.error(err, '/stores/item_sizes/' + req.params.id, req, res));
    });

    // Delete
    app.delete('/stores/item_sizes/:id', isLoggedIn, allowed('item_sizes_delete'), (req, res) => {
        if (req.query.item_id) {
            fn.getOne(
                m.stock,
                {item_size_id: req.params.id},
                {nullOK: true}
            )
            .then(stock => {
                if (stock) {
                    req.flash('danger', 'Cannot delete a size whilst it has stock');
                    res.redirect('/stores/item_sizes/' + req.params.id);
                } else {
                    fn.getOne(
                        m.nsns,
                        {item_size_id: req.params.id},
                        {nullOK: true}
                    )
                    .then(nsn => {
                        if (nsn) {
                            req.flash('danger', 'Cannot delete a size whilst it has NSNs assigned');
                            res.redirect('/stores/item_sizes/' + req.params.id);
                        } else {
                            fn.delete(
                                'item_sizes',
                                {item_size_id: req.params.id}
                            )
                            .then(result => {
                                req.flash('success', 'Item size deleted');
                                res.redirect('/stores/items/' + req.query.item_id);
                            })
                            .catch(err => fn.error(err, '/stores/item_sizes/' + req.params.id, req, res));
                        };
                    })
                    .catch(err => fn.error(err, '/stores/item_sizes/' + req.params.id, req, res));
                };
            })
            .catch(err => fn.error(err, '/stores/item_sizes/' + req.params.id, req, res));
        };
    });

    // Show
    app.get('/stores/item_sizes/:id', isLoggedIn, allowed('access_items'), (req, res) => {
        fn.getOne(
            m.item_sizes,
            {item_size_id: req.params.id},
            {
                include: fn.itemSize_inc({
                    supplier: true,
                    nsns:     true,
                    stock:    true,
                    serials:  true,
                    receipts: true,
                    issues:   {return_line_id: null},
                    orders:   {receipt_line_id: null},
                    requests: {_status: 'Pending'}
                })
            }
        )
        .then(item_size => {
            fn.getNotes('item_sizes', req.params.id, req)
            .then(notes =>{
                let stock = {};
                stock._stock     = fn.summer(item_size.stocks) || 0;
                stock._ordered   = fn.summer(item_size.order_lines) || 0;
                stock._issued    = fn.summer(item_size.issue_lines) || 0;
                stock._requested = fn.summer(item_size.request_lines) || 0;
                res.render('stores/item_sizes/show', {
                    item_size:  item_size,
                    notes: notes,
                    stock: stock,
                    query: {system: req.query.system || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
};