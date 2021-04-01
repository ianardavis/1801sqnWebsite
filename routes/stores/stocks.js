module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/stocks',    li, pm.check('access_stocks', {send: true}), (req, res) => {
        m.stocks.findAll({
            where:   req.query,
            include: [inc.locations({as: 'location'})],
        })
        .then(stocks => res.send({success: true, result: stocks}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/stock',    li,  pm.check('access_stocks', {send: true}), (req, res) => {
        m.stocks.findOne({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.locations({as: 'location'})
            ],
        })
        .then(stock => res.send({success: true, result: stock}))
        .catch(err => send_error(res, err));
    });

    app.post('/stocks',     li,   pm.check('stock_add',     {send: true}), (req, res) => {
        m.locations.findOrCreate({where: {_location: req.body._location}})
        .then(([location, created]) => {
            req.body.stock.location_id = location.location_id;
            return m.stocks.create(req.body.stock)
            .then(stock => res.send({success: true, message: 'Stock added'}))
            .catch(err => send_error(res, err));
        })
        .catch(err => send_error(res, err));
    });
    app.put('/stocks/:id',   li,  pm.check('stock_edit',    {send: true}), (req, res) => {
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
            .catch(err => send_error(res, err));
        })
        .catch(err => send_error(res, err));
        
    });
    
    app.delete('/stocks/:id', li, pm.check('stock_delete',  {send: true}), (req, res) => {
        m.stocks.findOne({where: {stock_id: req.params.id}})
        .then(stock => {
            if (stock._qty === 0) {
                return stock.destroy()
                .then(result => {
                    if (result) res.send({success: true, message: 'Stock deleted'})
                    else send_error(res, 'Stock NOT deleted');
                })
                .catch(err => send_error(res, err));
            } else send_error(res, 'Cannot delete whilst stock is not 0')
        })
        .catch(err => send_error(res, err));
    });
    
    updateStockLocation = (location_id, stock_id, res) => {
        m.stocks.update(
            {location_id: location_id},
            {where: {stock_id: stock_id}}
        )
        .then(result => res.send({success: true, message: 'Stock saved'}))
        .catch(err => send_error(res, err));
    };
};