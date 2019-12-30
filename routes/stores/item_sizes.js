const op = require('sequelize').Op;
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // New Form
    app.get('/stores/item_sizes/new', isLoggedIn, allowed('item_sizes_add'), (req, res) => {
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
                fn.getAll(m.sizes)
                .then(sizes => {
                    res.render('stores/item_sizes/new', {
                        item:     item,
                        sizes:    sizes,
                        suppliers: suppliers
                    });
                })
                .catch(err => fn.error(err, '/stores/items', req, res));
            })
            .catch(err => fn.error(err, '/stores/items', req, res));
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });

    // New Logic
    app.post('/stores/item_sizes', isLoggedIn, allowed('item_sizes_add'), (req, res) => {
        if (req.body.sizes) {
            var lines = [];
            req.body.sizes.forEach(size_id => {
                if (size_id) lines.push(fn.addSize(size_id, req.body.details));
            });
            if (lines.length > 0) {
                Promise.all(lines)
                .then(results => {
                    results.forEach(result => {
                        if (result.result) req.flash('success', 'Size added: ' + result.itemsize.itemsize_id);
                        else {
                            req.flash('danger', 'Error adding a size');
                            console.log(err);
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
            {itemsize_id: req.params.id},
            {
                include: fn.itemSizeInclude({include: false}, {include: false}, {include: false}, {include: false}, {include: false}),
                attributes: null,
                nullOK: false
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
        if (typeof(req.body.item_size._orderable) === 'undefined') req.body.item_size._orderable = 0
        else req.body.item_size._orderable = 1;
        fn.update(
            m.item_sizes,
            req.body.item_size,
            {itemsize_id: req.params.id}
        )
        .then(result => res.redirect('/stores/item_sizes/' + req.params.id))
        .catch(err => fn.error(err, '/stores/item_sizes/' + req.params.id, req, res));
    });

    // Delete
    app.delete('/stores/item_sizes/:id', isLoggedIn, allowed('item_sizes_delete'), (req, res) => {
        if (req.query.item_id) {
            fn.getOne(
                m.stock,
                {itemsize_id: req.params.id},
                {include: [], attributes: null, nullOK: true}
            )
            .then(stock => {
                if (stock) {
                    req.flash('danger', 'Cannot delete a size whilst it has stock');
                    res.redirect('/stores/item_sizes/' + req.params.id);
                } else {
                    fn.getOne(
                        m.nsns,
                        {itemsize_id: req.params.id},
                        {include: [], attributes: null, nullOK: true}
                    )
                    .then(nsn => {
                        if (nsn) {
                            req.flash('danger', 'Cannot delete a size whilst it has NSNs assigned');
                            res.redirect('/stores/item_sizes/' + req.params.id);
                        } else {
                            fn.delete(
                                'item_sizes',
                                {itemsize_id: req.params.id}
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
        var query = {};
        query.sn = req.query.sn || 2;
        fn.getOne(
            m.item_sizes,
            {itemsize_id: req.params.id},
            {
                include: fn.itemSizeInclude(
                    {include: true},
                    {include: true},
                    {include: true, where: {return_line_id: null}},
                    {include: true, where: {receipt_line_id: null}},
                    {include: true, where: {_status: 'Pending'}}),
                attributes: null,
                nullOK: false
            }
            
        )
        .then(item_size => {
            fn.getNotes('item_sizes', req.params.id, req)
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
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
};