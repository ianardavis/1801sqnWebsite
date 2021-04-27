module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/stocks/:id',    li, pm.get('access_stocks'),   (req, res) => res.render('stores/stocks/show'));
    app.get('/get/stocks',    li, pm.check('access_stocks'), (req, res) => {
        m.stocks.findAll({
            where:   req.query,
            include: [
                inc.size(),
                inc.location()
            ],
        })
        .then(stocks => res.send({success: true, result: stocks}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/stock',     li, pm.check('access_stocks'), (req, res) => {
        m.stocks.findOne({
            where:   req.query,
            include: [
                inc.size(),
                inc.location()
            ],
        })
        .then(stock => res.send({success: true, result: stock}))
        .catch(err => send_error(res, err));
    });

    app.post('/stocks',       li, pm.check('stock_add'),     (req, res) => {
        m.sizes.findOne({
            where: {size_id: req.body.stock.size_id},
            attributes: ['size_id']
        })
        .then(size => {
            if (!size) send_error(res, 'Size not found')
            else {
                return m.locations.findOrCreate({where: {location: req.body.location}})
                .then(([location, created]) => {
                    return m.stocks.findOrCreate({
                        where: {
                            size_id:     size.size_id,
                            location_id: location.location_id
                        }
                    })
                    .then(([stock, created]) => res.send({success: true, message: 'Stock location added'}))
                    .catch(err => send_error(res, err));
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
    app.put('/stocks/:id',    li, pm.check('stock_edit'),    (req, res) => {
        m.stocks.findOne({where: {stock_id: req.params.id}})
        .then(stock => {
            if (!stock) send_error(res, 'Stock record not found')
            else {
                return m.locations.findOrCreate({where: {location: req.body.location}})
                .then(([location, created]) => {
                    return stock.update({location_id: location.location_id})
                    .then(result => res.send({success: true, message: 'Stock saved'}))
                    .catch(err => send_error(res, err));
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
        
    });
    
    app.delete('/stocks/:id', li, pm.check('stock_delete'),  (req, res) => {
        m.stocks.findOne({where: {stock_id: req.params.id}})
        .then(stock => {
            if      (!stock)        send_error(res, 'Stock record not found')
            else if (stock.qty > 0) send_error(res, 'Cannot delete whilst stock is not 0')
            else {
                return m.actions.findOne({where: {stock_id: stock.stock_id}})
                .then(action => {
                    if (action) send_error(res, 'Cannot delete a stock record which has actions')
                    else {
                        return m.adjustments.findOne({where: {stock_id: stock.stock_id}})
                        .then(adjustment => {
                            if (adjustment) send_error(res, 'Cannot delete a stock record which has adjustments')
                            else {
                                return stock.destroy()
                                .then(result => {
                                    if (result) res.send({success: true, message: 'Stock deleted'})
                                    else send_error(res, 'Stock NOT deleted');
                                })
                                .catch(err => send_error(res, err));
                            };
                        })
                        .catch(err => send_error(res, err));
                    };
                })
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });
};