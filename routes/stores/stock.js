module.exports = (app, allowed, inc, permissions, m) => {
    app.get('/stores/get/stocks',   permissions, allowed('access_stock', {send: true}), (req, res) => {
        m.stores.stock.findAll({
            where:   req.query,
            include: [inc.locations({as: 'location'})],
        })
        .then(stocks => res.send({result: true, stocks: stocks}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/stock',    permissions, allowed('access_stock', {send: true}), (req, res) => {
        m.stores.stock.findOne({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.locations({as: 'location'})
            ],
        })
        .then(stock => res.send({result: true, stock: stock}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/stock',       permissions, allowed('stock_add',    {send: true}), (req, res) => {
        m.stores.locations.findOrCreate({where: {_location: req.body._location}})
        .then(([location, created]) => {
            req.body.stock.location_id = location.location_id;
            return m.stores.stock.create(req.body.stock)
            .then(stock => res.send({result: true, message: 'Stock added'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/stock/:id',    permissions, allowed('stock_edit',   {send: true}), (req, res) => {
        m.stores.stock.findOne({where: {stock_id: req.params.id}})
        .then(stock => {
            return m.stores.locations.findOrCreate({where: {_location: req.body._location}})
            .then(([location, created]) => {
                if (created) updateStockLocation(new_location.location_id, req.params.id, res)
                else {
                    if (location.location_id !== stock.location_id) {
                        updateStockLocation(location.location_id, req.params.id, res)
                    } else res.send({result: false, message: 'No changes'});
                };
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
        
    });
    
    app.delete('/stores/stock/:id', permissions, allowed('stock_delete', {send: true}), (req, res) => {
        m.stores.stock.findOne({where: {stock_id: req.params.id}})
        .then(stock => {
            if (stock._qty === 0) {
                return stock.destroy()
                .then(result => {
                    if (result) res.send({result: true, message: 'Stock deleted'})
                    else res.error.send('Stock NOT deleted', res);
                })
                .catch(err => res.error.send(err, res));
            } else res.error.send('Cannot delete whilst stock is not 0', res)
        })
        .catch(err => res.error.send(err, res));
    });
    
    updateStockLocation = (location_id, stock_id, res) => {
        m.stores.stock.update(
            {location_id: location_id},
            {where: {stock_id: stock_id}}
        )
        .then(result => res.send({result: true, message: 'Stock saved'}))
        .catch(err => res.error.send(err, res));
    };
};