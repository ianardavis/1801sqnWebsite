module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //NEW
    app.get('/stores/stock/new', isLoggedIn, allowed('stock_add'), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.query.size_id},
            {include: inc.sizes()}
        )
        .then(item => res.render('stores/stock/new', {item: item}))
        .catch(err => fn.error(err, '/', req, res));
    });
    //SHOW
    app.get('/stores/stock/:id', isLoggedIn, allowed('access_stock'), (req, res) => {
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
                res.render('stores/stock/show', {
                    stock: stock,
                    notes: notes,
                    query: {system: req.query.system || 2},
                    show_tab: req.query.tab || 'details'
                });
            });
        })
        .catch(err => fn.error(err, '/', req, res));
    });
    //EDIT
    app.get('/stores/stock/:id/edit', isLoggedIn, allowed('stock_edit'), (req, res) => {
        fn.getOne(
            m.stock,
            {stock_id: req.params.id},
            {include: [m.locations]}
        )
        .then(stock => res.render('stores/stock/edit', {stock: stock}))
        .catch(err => fn.error(err, '/', req, res));
    });
    
    //POST
    app.post('/stores/stock', isLoggedIn, allowed('stock_add', {send: true}), (req, res) => {
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
                .catch(err => fn.send_error(err.message, res));
            };
        })
        .catch(err => fn.send_error(err.message, res));
    });
    function createStock(stock, req, res) {
        fn.create(m.stock,stock)
        .then(stock => res.send({result: true, message: 'Stock added'}))
        .catch(err => fn.send_error(err.message, res));;
    };

    //PUT
    app.put('/stores/stock/:id', isLoggedIn, allowed('stock_edit', {send: true}), (req, res) => {
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
                        updateStockLocation(location.location_id, req.params.id, res)
                    } else fn.send_error('No changes', res);
                } else {
                    fn.create(
                        m.locations,
                        {_location: req.body._location}
                    )
                    .then(new_location => {
                        updateStockLocation(new_location.location_id, req.params.id, res)
                    })
                    .catch(err => fn.send_error(err.message, res));
                };
            })
            .catch(err => fn.send_error(err.message, res));
        })
        .catch(err => fn.send_error(err.message, res));
        
    });
    function updateStockLocation(location_id, stock_id, res) {
        fn.update(
            m.stock,
            {location_id: location_id},
            {stock_id: stock_id}
        )
        .then(result => res.send({result: true, message: 'Stock saved'}))
        .catch(err => fn.send_error(err.message, res));
    };

    //DELETE
    app.delete('/stores/stock/:id', isLoggedIn, allowed('stock_delete', {send: true}), (req, res) => {
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
                    if (result) res.send({result: true, message: 'Stock deleted'})
                    else fn.send_error('Stock NOT deleted', res);
                })
                .catch(err => fn.send_error(err.message, res));
            } else fn.send_error('Cannot delete whilst stock is not 0', res)
        })
        .catch(err => fn.send_error(err.message, res));
    });
};