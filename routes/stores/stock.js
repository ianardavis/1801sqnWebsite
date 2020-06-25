module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db = require(process.env.ROOT + '/fn/db');
    app.get('/stores/stock/new',      isLoggedIn, allowed('stock_add'),                  (req, res) => {
        db.findOne({
            table: m.sizes,
            where: {size_id: req.query.size_id},
            include: [inc.sizes()]
        })
        .then(item => res.render('stores/stock/new', {item: item}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/stock/:id',      isLoggedIn, allowed('access_stock'),               (req, res) => {
        db.findOne({
            table: m.stock,
            where: {stock_id: req.params.id},
            include: [
                inc.sizes(),
                m.locations
        ]})
        .then(stock => {
            res.render('stores/stock/show', {
                stock: stock,
                notes: {table: 'stock', id: stock.stock_id},
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/stock/:id/edit', isLoggedIn, allowed('stock_edit'),                 (req, res) => {
        db.findOne({
            table: m.stock,
            where: {stock_id: req.params.id},
            include: [m.locations]
        })
        .then(stock => res.render('stores/stock/edit', {stock: stock}))
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/stock',      isLoggedIn, allowed('access_stock', {send: true}), (req, res) => {
        m.stock.findAll({
            where: req.query,
            include: [inc.locations({as: 'location'})]
        })
        .then(stock => res.send({result: true, stock: stock}))
        .catch(err => res.error.send(err, res));
    });
    
    app.post('/stores/stock',         isLoggedIn, allowed('stock_add',    {send: true}), (req, res) => {
        m.locations.findOne({where: {_location: req.body.location}})
        .then(location => {
            if (location) {
                req.body.stock.location_id = location.location_id;
                createStock(req.body.stock, res);
            } else {
                m.locations.create({_location: req.body.location})
                .then(location => {
                    req.body.stock.location_id = location.location_id;
                    createStock(req.body.stock, res);
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/stock/:id',      isLoggedIn, allowed('stock_edit',   {send: true}), (req, res) => {
        db.findOne({
            table: m.stock,
            where: {stock_id: req.params.id}
        })
        .then(stock => {
            db.findOne({
                table: m.locations,
                where: {_location: req.body._location}
            })
            .then(location => {
                if (location) {
                    if (Number(location.location_id) !== Number(stock.location_id)) {
                        updateStockLocation(location.location_id, req.params.id, res)
                    } else res.error.send('No changes', res);
                } else {
                    m.locations.create({_location: req.body._location})
                    .then(new_location => updateStockLocation(new_location.location_id, req.params.id, res))
                    .catch(err => res.error.send(err, res));
                };
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
        
    });
    app.delete('/stores/stock/:id',   isLoggedIn, allowed('stock_delete', {send: true}), (req, res) => {
        db.findOne({
            table: m.stock,
            where: {stock_id: req.params.id}
        })
        .then(stock => {
            if (stock._qty === 0) {
                db.destroy({
                    table: m.stock,
                    where: {stock_id: req.params.id}
                })
                .then(result => {
                    if (result) res.send({result: true, message: 'Stock deleted'})
                    else res.error.send('Stock NOT deleted', res);
                })
                .catch(err => res.error.send(err, res));
            } else res.error.send('Cannot delete whilst stock is not 0', res)
        })
        .catch(err => res.error.send(err, res));
    });
    
    createStock = (stock, res) => {
        m.stock.create(stock)
        .then(stock => res.send({result: true, message: 'Stock added'}))
        .catch(err => res.error.send(err, res));;
    };
    updateStockLocation = (location_id, stock_id, res) => {
        db.update({
            tbale: m.stock,
            where: {stock_id: stock_id},
            record: {location_id: location_id}
        })
        .then(result => res.send({result: true, message: 'Stock saved'}))
        .catch(err => res.error.send(err, res));
    };
};