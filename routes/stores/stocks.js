module.exports = (app, m, fn) => {
    app.get('/stocks/:id',          fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/stocks/show'));
    app.get('/get/stocks',          fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.stocks.findAll({
            where:   JSON.parse(req.query.where),
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ],
            ...fn.sort(req.query.sort)
        })
        .then(stocks => res.send({success: true, result: stocks}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/stocks',          fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.stocks.sum('qty', {where: req.query})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/negative_stock',  fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.stocks.findAll({
            where: {qty: {[fn.op.lt]: 0}},
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ],
            ...fn.sort(req.query.sort)
        })
        .then(stocks => res.send({success: true, result: stocks}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/stock',           fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.get(
            'stocks',
            JSON.parse(req.query.where),
            [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ]
        )
        .then(stock => res.send({success: true, result: stock}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/stocks',             fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'sizes',
            {size_id: req.body.stock.size_id}
        )
        .then(size => {
            return m.locations.findOrCreate({where: {location: req.body.location}})
            .then(([location, created]) => {
                return m.stocks.findOrCreate({
                    where: {
                        size_id:     size.size_id,
                        location_id: location.location_id
                    }
                })
                .then(([stock, created]) => res.send({success: true, message: 'Stock location added'}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/stocks/:id',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'stocks',
            {stock_id: req.params.id}
        )
        .then(stock => {
            return m.locations.findOrCreate({where: {location: req.body.location}})
            .then(([location, created]) => {
                return fn.update(stock, {location_id: location.location_id})
                .then(result => res.send({success: true, message: 'Stock saved'}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
        
    });
    app.put('/stocks/:id/transfer', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'stocks',
            {stock_id: req.params.id},
            [m.locations]
        )
        .then(stock_from => {
            if (req.body.qty > stock_from.qty) fn.send_error(res, 'Transfer quantity is greater than stock quantity')
            else {
                return m.locations.findOrCreate({where: {location: req.body.location_to}})
                .then(([location, created]) => {
                    if (
                        stock_from.location_id       === location.location_id ||
                        stock_from.location.location === location.location
                    ) {
                        fn.send_error(res, 'Transfer to and from locations are the same')
                    } else {
                        return m.stocks.findOrCreate({
                            where:    {location_id: location.location_id},
                            defaults: {size_id:     stock_from.size_id}
                        })
                        .then(([stock_to, created]) => {
                            return Promise.all([
                                stock_from.decrement('qty', {by: req.body.qty}),
                                stock_to  .increment('qty', {by: req.body.qty})
                            ])
                            .then(result => {
                                return fn.actions.create(
                                    `TRANSFER | From: ${stock_from.location.location} | To: ${location.location} | Qty: ${req.body.qty}`,
                                    req.user.user_id,
                                    [
                                        {table: 'stocks', id: stock_from.stock_id},
                                        {table: 'stocks', id: stock_to  .stock_id}
                                    ]
                                )
                                .then(result => res.send({success: true, message: 'Stock transferred'}))
                                .catch(err =>   res.send({success: true, message: 'Stock transferred'}));
                            })
                            .catch(err => fn.send_error(res, err));
                        })
                        .catch(err => fn.send_error(res, err));
                    };
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    
    app.delete('/stocks/:id',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.get(
            'stocks',
            {stock_id: req.params.id}
        )
        .then(stock => {
            if (stock.qty > 0) fn.send_error(res, 'Cannot delete whilst stock is not 0')
            else {
                return m.actions.findOne({where: {stock_id: stock.stock_id}})
                .then(action => {
                    if (action) fn.send_error(res, 'Cannot delete a stock record which has actions')
                    else {
                        return m.adjustments.findOne({where: {stock_id: stock.stock_id}})
                        .then(adjustment => {
                            if (adjustment) fn.send_error(res, 'Cannot delete a stock record which has adjustments')
                            else {
                                return stock.destroy()
                                .then(result => {
                                    if (result) res.send({success: true, message: 'Stock deleted'})
                                    else fn.send_error(res, 'Stock NOT deleted');
                                })
                                .catch(err => fn.send_error(res, err));
                            };
                        })
                        .catch(err => fn.send_error(res, err));
                    };
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};