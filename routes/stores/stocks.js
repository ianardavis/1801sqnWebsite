module.exports = (app, m, pm, op, inc, send_error) => {
    app.get('/get/stocks',    pm.check('access_stocks', {send: true}), (req, res) => {
        m.stocks.findAll({
            where:   req.query,
            include: [inc.locations({as: 'location'})],
        })
        .then(stocks => res.send({success: true, result: stocks}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/stock',     pm.check('access_stocks', {send: true}), (req, res) => {
        m.stocks.findOne({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.locations({as: 'location'})
            ],
        })
        .then(stock => res.send({success: true, result: stock}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stocks',       pm.check('stock_add',     {send: true}), (req, res) => {
        m.locations.findOrCreate({where: {_location: req.body._location}})
        .then(([location, created]) => {
            req.body.stock.location_id = location.location_id;
            return m.stocks.create(req.body.stock)
            .then(stock => res.send({success: true, message: 'Stock added'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stocks/:id',    pm.check('stock_edit',    {send: true}), (req, res) => {
        m.stocks.findOne({where: {stock_id: req.params.id}})
        .then(stock => {
            return m.locations.findOrCreate({where: {_location: req.body._location}})
            .then(([location, created]) => {
                if (created) updateStockLocation(new_location.location_id, req.params.id, res)
                else {
                    if (location.location_id !== stock.location_id) {
                        updateStockLocation(location.location_id, req.params.id, res)
                    } else res.send({success: false, message: 'No changes'});
                };
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
        
    });
    
    app.delete('/stocks/:id', pm.check('stock_delete',  {send: true}), (req, res) => {
        m.stocks.findOne({where: {stock_id: req.params.id}})
        .then(stock => {
            if (stock._qty === 0) {
                return stock.destroy()
                .then(result => {
                    if (result) res.send({success: true, message: 'Stock deleted'})
                    else res.error.send('Stock NOT deleted', res);
                })
                .catch(err => res.error.send(err, res));
            } else res.error.send('Cannot delete whilst stock is not 0', res)
        })
        .catch(err => res.error.send(err, res));
    });
    
    updateStockLocation = (location_id, stock_id, res) => {
        m.stocks.update(
            {location_id: location_id},
            {where: {stock_id: stock_id}}
        )
        .then(result => res.send({success: true, message: 'Stock saved'}))
        .catch(err => res.error.send(err, res));
    };
};