module.exports = (app, m, fn) => {
    app.get('/stocks/:id',         fn.loggedIn(), fn.permissions.get('access_stocks'),   (req, res) => res.render('stores/stocks/show'));
    app.get('/get/stocks',         fn.loggedIn(), fn.permissions.check('access_stocks'), (req, res) => {
        m.stocks.findAll({
            where:   req.query,
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ],
        })
        .then(stocks => res.send({success: true, result: stocks}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/stocks',         fn.loggedIn(), fn.permissions.check('access_stocks'), (req, res) => {
        m.stocks.sum('qty', {where: req.query})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/negative_stock', fn.loggedIn(), fn.permissions.check('access_stocks'), (req, res) => {
        m.stocks.findAll({
            where: {qty: {[fn.op.lt]: 0}},
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ],
        })
        .then(stocks => res.send({success: true, result: stocks}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/stock',          fn.loggedIn(), fn.permissions.check('access_stocks'), (req, res) => {
        fn.get(
            'stocks',
            req.query,
            [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ]
        )
        .then(stock => res.send({success: true, result: stock}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/stocks',            fn.loggedIn(), fn.permissions.check('stock_add'),     (req, res) => {
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
    app.put('/stocks/:id',         fn.loggedIn(), fn.permissions.check('stock_edit'),    (req, res) => {
        fn.get(
            'stocks',
            {stock_id: req.params.id}
        )
        .then(stock => {
            return m.locations.findOrCreate({where: {location: req.body.location}})
            .then(([location, created]) => {
                return stock.update({location_id: location.location_id})
                .then(result => res.send({success: true, message: 'Stock saved'}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
        
    });
    
    app.delete('/stocks/:id',      fn.loggedIn(), fn.permissions.check('stock_delete'),  (req, res) => {
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