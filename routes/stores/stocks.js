module.exports = (app, m, fn) => {
    let op = require('sequelize').Op;
    app.get('/stocks/:id',          fn.loggedIn(), fn.permissions.get('access_stores'),        (req, res) => res.render('stores/stocks/show'));
    app.get('/get/stocks',          fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        let where = req.query.where || {};
        if (req.query.gt) where[req.query.gt.column] = {[op.gt]: req.query.gt.value};
        if (req.query.lt) where[req.query.lt.column] = {[op.lt]: req.query.lt.value};
        m.stocks.findAndCountAll({
            where:   where,
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('stocks', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/sum/stocks',          fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.stocks.sum('qty', {where: req.query.where})
        .then(sum => res.send({success: true, result: sum}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/stock',           fn.loggedIn(), fn.permissions.check('access_stores'),      (req, res) => {
        m.stocks.findOne({
            where: req.query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ]
        })
        .then(stock => {
            if (stock) res.send({success: true, result: stock})
            else res.send({success: false, message: 'Stock not found'});
        })
        .catch(err => fn.send_error(res, err));
    });

    app.post('/stocks',             fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.sizes.get(req.body.stock.size_id)
        .then(size => {
            m.locations.findOrCreate({where: {location: req.body.location}})
            .then(([location, created]) => {
                m.stocks.findOrCreate({
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
        if (!req.body.counts) fn.send_error(res, 'No details')
        else {
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
        fn.stocks.get({stock_id: req.params.id})
        .then(stock => {
            m.locations.findOrCreate({where: {location: req.body.location}})
            .then(([location, created]) => {
                fn.update(stock, {location_id: location.location_id})
                .then(result => res.send({success: true, message: 'Stock saved'}))
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
        if (!req.body.scrap) fn.send_error(res, 'No details')
        else {
            fn.stocks.scrap(req.params.id, req.body.scrap, req.user.user_id)
            .then(result => res.send({success: true, message: 'Stock scrapped'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.put('/stocks/:id/count',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        if (!req.body.count) fn.send_error(res, 'No details')
        else {
            fn.stocks.count(req.params.id, req.body.count.qty, req.user.user_id)
            .then(result => res.send({success: true, message: 'Stock counted'}))
            .catch(err => fn.send_error(res, err));
        };
    });
    app.put('/stocks/:id/:type',    fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {fn.send_error(res, 'Invalid type')});
    
    app.delete('/stocks/:id',       fn.loggedIn(), fn.permissions.check('stores_stock_admin'), (req, res) => {
        fn.stocks.get({stock_id: req.params.id})
        .then(stock => {
            if (stock.qty > 0) fn.send_error(res, 'Cannot delete whilst stock is not 0')
            else {
                m.actions.findOne({where: {stock_id: stock.stock_id}})
                .then(action => {
                    if (action) fn.send_error(res, 'Cannot delete a stock record which has actions')
                    else {
                        m.adjustments.findOne({where: {stock_id: stock.stock_id}})
                        .then(adjustment => {
                            if (adjustment) fn.send_error(res, 'Cannot delete a stock record which has adjustments')
                            else {
                                stock.destroy()
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