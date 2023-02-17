module.exports = (app, fn) => {
    app.get('/stocks/:id',          fn.loggedIn(), fn.permissions.get(  'access_stores'),      (req, res) => res.render('stores/stocks/show'));
    app.get('/get/stocks',          fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        let where = req.query.where || {};
        if (req.query.gt) where[req.query.gt.column] = {[fn.op.gt]: req.query.gt.value};
        if (req.query.lt) where[req.query.lt.column] = {[fn.op.lt]: req.query.lt.value};
        fn.stocks.getAll(
            where,
            fn.pagination(req.query))
        .then(results => fn.send_res('stocks', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/stocks',          fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.stocks.sum(req.query.where)
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/stock',           fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        fn.stocks.get(req.query.where)
        .then(stock => res.send({success: true, result: stock}))
        .catch(err => fn.send_error(res, err));
    });

    app.post('/stocks',             fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.stocks.create(req.body.stock.size_id, req.body.location)
        .then(result => res.send({success: true, message: 'Stock location added'}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/stocks/receipts',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.stocks.receive({
            stock:   {stock_id: req.body.receipt.stock_id},
            qty:     req.body.receipt.qty,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: 'Stock received'}))
        .catch(err => fn.send_error(res, err));
    });

    app.put('/stocks/counts',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        if (!req.body.counts) {
            fn.send_error(res, 'No details');

        } else {
            let actions = [];
            req.body.counts.filter(a => a.qty).forEach(count => {
                actions.push(fn.stocks.count(count.stock_id, count.qty, req.user.user_id))
            })
            Promise.allSettled(actions)
            .then(results => {
                results.filter(e => e.status === 'rejected').forEach(e => console.log(e));
                res.send({success: true, message: 'Counts saved', result: req.body.location_id});
            })
            .catch(err => fn.send_error(res, err));

        };
    });
    app.put('/stocks/:id',          fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.stocks.getByID(req.params.id)
        .then(stock => {
            fn.locations.findOrCreate(req.body.location)
            .then(location => {
                stock.update({location_id: location.location_id})
                .then(result => res.send({success: result, message: `Stock ${(result ? '' : 'not ')}saved`}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
        
    });
    app.put('/stocks/:id/transfer', fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.stocks.transfer(req.params.id, req.body.location_to, req.body.qty, req.user.user_id)
        .then(result => res.send({success: true, message: 'Stock transferred'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/stocks/:id/scrap',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        if (!req.body.scrap) {
            fn.send_error(res, 'No details');

        } else {
            fn.stocks.scrap(req.params.id, req.body.scrap, req.user.user_id)
            .then(result => res.send({success: true, message: 'Stock scrapped'}))
            .catch(err => fn.send_error(res, err));

        };
    });
    app.put('/stocks/:id/count',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        if (!req.body.count) {
            fn.send_error(res, 'No details');

        } else {
            fn.stocks.count(req.params.id, req.body.count.qty, req.user.user_id)
            .then(result => res.send({success: true, message: 'Stock counted'}))
            .catch(err => fn.send_error(res, err));

        };
    });
    app.put('/stocks/:id/:type',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {fn.send_error(res, 'Invalid type')});
    
    app.delete('/stocks/:id',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        Promise.all([
            fn.stocks.getByID(req.params.id),
            fn.actions.get({_table: 'stocks', id: stock.stock_id}),
            fn.adjustments.get({stock_id: stock.stock_id})
        ])
        .then(([stock, action, adjustment]) => {
            if (stock.qty > 0) {
                fn.send_error(res, 'Cannot delete whilst stock is not 0');

            } else if (action) {
                fn.send_error(res, 'Cannot delete a stock record which has actions');

            } else if (adjustment) {
                fn.send_error(res, 'Cannot delete a stock record which has adjustments');

            } else {
                stock.destroy()
                .then(result => {
                    if (result) {
                        res.send({success: true, message: 'Stock deleted'});

                    } else {
                        fn.send_error(res, 'Stock not deleted');
                    
                    };
                })
                .catch(err => fn.send_error(res, err));
                
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};