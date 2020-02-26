module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    // New Form
    app.get('/stores/stock/new', isLoggedIn, allowed('stock_add'), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.query.size_id},
            {include: inc.sizes()}
        )
        .then(item => res.render('stores/stock/new', {item: item}))
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    // New Logic
    app.post('/stores/stock', isLoggedIn, allowed('stock_add'), (req, res) => {
        fn.getOne(
            m.locations,
            {_location: req.body.location},
            {nullOK: true}
        )
        .then(location => {
            if (location) {
                req.body.stock.location_id = location.location_id;
                createStock(req.body.stock, req, res);
            } else {
                fn.create(m.locations, {_location: req.body.location})
                .then(location => {
                    req.body.stock.location_id = location.location_id;
                    createStock(req.body.stock, req, res);
                })
                .catch(err => fn.error(err, '/stores/items', req, res));
            };
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    function createStock(stock, req, res) {
        fn.create(m.stock,stock)
        .then(stock => res.redirect('/stores/sizes/' + stock.size_id))
        .catch(err => fn.error(err, '/stores/items', req, res));;
    };

    // Edit
    app.get('/stores/stock/:id/edit', isLoggedIn, allowed('stock_edit'), (req, res) => {
        fn.getOne(
            m.stock,
            {stock_id: req.params.id},
            {
                include: [
                    inc.sizes(),
                    inc.adjusts(),
                    inc.receipt_lines({receipts: true, as: 'receipts'}),
                    inc.issue_lines({issues: true, as: 'issues'}),
                    inc.return_lines({returns: true, as: 'returns'}),
                    m.locations
                ]
            }
        )
        .then(stock => {
            fn.getNotes('stock', req.params.id, req)
            .then(notes => {
                res.render('stores/stock/edit', {
                    stock: stock,
                    notes: notes,
                    query: {sn: req.query.sn || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    // Put
    app.put('/stores/stock/:id', isLoggedIn, allowed('stock_edit'), (req, res) => {
        fn.getOne(
            m.stock,
            {stock_id: req.params.id}
        )
        .then(stock => {
            fn.getOne(
                m.locations,
                {_location: req.body._location}
            )
            .then(location => {
                if (location) {
                    if (Number(location.location_id) !== Number(stock.location_id)) {
                        updateStockLocation(stock.size_id, location.location_id, req, res)
                    } else {
                        req.flash('info', 'No changes')
                        res.redirect('/stores/sizes/' + stock.size_id)
                    };
                } else {
                    fn.create(
                        m.locations,
                        {_location: req.body._location}
                    )
                    .then(new_location => {
                        updateStockLocation(stock.size_id, new_location.location_id, req, res)
                    })
                    .catch(err => fn.error(err, '/stores/sizes/' + stock.size_id, req, res));
                };
            })
            .catch(err => fn.error(err, '/stores/sizes/' + stock.size_id, req, res));
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
        
    });
    function updateStockLocation(size_id, location_id, req, res) {
        fn.update(
            m.stock,
            {location_id: location_id},
            {stock_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Stock updated');
            res.redirect('/stores/sizes/' + size_id)
        })
        .catch(err => fn.error(err, '/stores/sizes/' + size_id, req, res));
    };

    // Delete
    app.delete('/stores/stock/:id', isLoggedIn, allowed('stock_delete'), (req, res) => {
        fn.getOne(
            m.stock,
            {stock_id: req.params.id}
        )
        .then(stock => {
            if (stock._qty === 0) {
                fn.delete(
                    'stock',
                    {stock_id: req.params.id}
                )
                .then(result => {
                    if (result) req.flash('success', 'Stock deleted')
                    res.redirect('/stores/sizes/' + stock.size_id)
                })
                .catch(err => fn.error(err, '/stores/items', req, res));
            } else {
                req.flash('danger', 'Cannot delete stock!');
                res.redirect('/stores/sizes/' + stock.size_id);
            };
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
};