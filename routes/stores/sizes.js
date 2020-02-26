const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    // New Form
    app.get('/stores/sizes/new', isLoggedIn, allowed('size_add'), (req, res) => {
        fn.getOne(m.items, {item_id: req.query.item_id})
        .then(item => {
            fn.getAll(m.suppliers)
            .then(suppliers => {
                res.render('stores/sizes/new', {
                    item:      item,
                    suppliers: suppliers
                });
            })
            .catch(err => fn.error(err, '/stores/items', req, res));
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    // New Logic
    app.post('/stores/sizes', isLoggedIn, allowed('size_add'), (req, res) => {
        if (req.body.sizes) {
            let lines = [];
            req.body.sizes.forEach(size => {
                if (size !== '') lines.push(fn.addSize(size, req.body.details));
            });
            if (lines.length > 0) {
                Promise.allSettled(lines)
                .then(results => {
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
    app.get('/stores/sizes/:id/edit', isLoggedIn, allowed('size_edit'), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.params.id},
            {
                include: inc.sizes({include: [m.items, inc.suppliers()]})
            }
        )
        .then(size => {
            fn.getAll(m.suppliers)
            .then(suppliers => {
                res.render('stores/sizes/edit', {
                    size:  size,
                    suppliers: suppliers
                });
            })
            .catch(err => fn.error(err, '/stores/sizes/' + req.params.id, req, res));
        })
        .catch(err => fn.error(err, 'stores/sizes/' + req.params.id, req, res));
    });
    // Put
    app.put('/stores/sizes/:id', isLoggedIn, allowed('size_edit'), (req, res) => {
        ['_issueable', '_orderable', '_serials', '_nsns'].forEach(checkbox => {
            if (typeof(req.body.size[checkbox]) === 'undefined') req.body.size[checkbox] = 0
            else req.body.size[checkbox] = 1;
        });        
        fn.update(
            m.sizes,
            req.body.size,
            {size_id: req.params.id}
        )
        .then(result => res.redirect('/stores/sizes/' + req.params.id))
        .catch(err => fn.error(err, '/stores/sizes/' + req.params.id, req, res));
    });

    // Delete
    app.delete('/stores/sizes/:id', isLoggedIn, allowed('size_delete'), (req, res) => {
        if (req.query.item_id) {
            fn.getOne(
                m.stock,
                {size_id: req.params.id},
                {nullOK: true}
            )
            .then(stock => {
                if (stock) {
                    req.flash('danger', 'Cannot delete a size whilst it has stock');
                    res.redirect('/stores/sizes/' + req.params.id);
                } else {
                    fn.getOne(
                        m.nsns,
                        {size_id: req.params.id},
                        {nullOK: true}
                    )
                    .then(nsn => {
                        if (nsn) {
                            req.flash('danger', 'Cannot delete a size whilst it has NSNs assigned');
                            res.redirect('/stores/sizes/' + req.params.id);
                        } else {
                            fn.delete(
                                'sizes',
                                {size_id: req.params.id}
                            )
                            .then(result => {
                                req.flash('success', 'Item size deleted');
                                res.redirect('/stores/items/' + req.query.item_id);
                            })
                            .catch(err => fn.error(err, '/stores/sizes/' + req.params.id, req, res));
                        };
                    })
                    .catch(err => fn.error(err, '/stores/sizes/' + req.params.id, req, res));
                };
            })
            .catch(err => fn.error(err, '/stores/sizes/' + req.params.id, req, res));
        };
    });

    // Show
    app.get('/stores/sizes/:id', isLoggedIn, allowed('access_items'), (req, res) => {
        let include = [m.items];
        include.push(inc.suppliers());
        include.push(inc.nsns());
        include.push(inc.serials());
        include.push(
            inc.stock({
                include: [
                    m.locations,
                    inc.issue_lines({
                        issues: true,
                        as: 'issues',
                        where: {return_line_id: null}
                    }),
                    inc.receipt_lines({
                        as: 'receipts',
                        receipts: true
                    })
                ]
            })
        );
        include.push(inc.request_lines({as: 'requests', requests: true, where: {_status: 'Pending'},    required: false}));
        include.push(inc.order_lines({as: 'orders',     orders: true,   where: {receipt_line_id: null}, required: false}));
        fn.getOne(
            m.sizes,
            {size_id: req.params.id},
            {include: include}
        )
        .then(size => {
            fn.getNotes('sizes', req.params.id, req)
            .then(notes =>{
                let stock = {};
                stock._stock     = fn.summer(size.stocks) || 0;
                stock._ordered   = fn.summer(size.orders) || 0;
                stock._issued    = fn.summer(size.issues) || 0;
                stock._requested = fn.summer(size.requests) || 0;
                res.render('stores/sizes/show', {
                    size:  size,
                    notes: notes,
                    stock: stock,
                    query: {system: req.query.system || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
};