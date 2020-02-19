module.exports = (app, allowed, fn, isLoggedIn, m) => {
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
        .then(stock => res.redirect('/stores/item_sizes/' + stock.item_size_id))
        .catch(err => fn.error(err, '/stores/items', req, res));;
    };

    // New Form
    app.get('/stores/stock/new', isLoggedIn, allowed('stock_add'), (req, res) => {
        fn.getOne(
            m.item_sizes,
            {item_size_id: req.query.item_size_id},
            {include: fn.itemSize_inc()}
        )
        .then(item => res.render('stores/stock/new', {item: item}))
        .catch(err => fn.error(err, '/stores/items', req, res));
    });

    // Edit
    app.get('/stores/stock/:id/edit', isLoggedIn, allowed('stock_edit'), (req, res) => {
        fn.getOne(
            m.stock,
            {stock_id: req.params.id},
            {
                include: [
                    {model: m.item_sizes, include: [m.items]},
                    {model: m.adjusts,    include: [fn.users()]},
                    {model: m.receipt_lines, include: [{model: m.receipts, include: [fn.users()]}]},
                    {model: m.issue_lines,   include: [{model: m.issues,   include: [fn.users('_to')]}]},
                    {model: m.return_lines,  include: [{model: m.returns,  include: [fn.users('_from')]}]},
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
                        updateStockLocation(stock.item_size_id, location.location_id, req, res)
                    } else {
                        req.flash('info', 'No changes')
                        res.redirect('/stores/item_sizes/' + stock.item_size_id)
                    };
                } else {
                    fn.create(
                        m.locations,
                        {_location: req.body._location}
                    )
                    .then(new_location => {
                        updateStockLocation(stock.item_size_id, new_location.location_id, req, res)
                    })
                    .catch(err => fn.error(err, '/stores/item_sizes/' + stock.item_size_id, req, res));
                };
            })
            .catch(err => fn.error(err, '/stores/item_sizes/' + stock.item_size_id, req, res));
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
        
    });
    function updateStockLocation(item_size_id, location_id, req, res) {
        fn.update(
            m.stock,
            {location_id: location_id},
            {stock_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Stock updated');
            res.redirect('/stores/item_sizes/' + item_size_id)
        })
        .catch(err => fn.error(err, '/stores/item_sizes/' + item_size_id, req, res));
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
                    res.redirect('/stores/item_sizes/' + stock.item_size_id)
                })
                .catch(err => fn.error(err, '/stores/items', req, res));
            } else {
                req.flash('danger', 'Cannot delete stock!');
                res.redirect('/stores/item_sizes/' + stock.item_size_id);
            };
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
};