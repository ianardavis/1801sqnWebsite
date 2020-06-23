module.exports = {
    add: (options = {}) => new Promise((resolve, reject) => {
        options.table.findByPk(options.id)
        .then(stock => stock.increment('_qty', {by: options.qty}))
        .then(stock => resolve(stock.qty))
        .catch(err => reject(err));
    }),
    subtract: (options = {}) => new Promise((resolve, reject) => {
        options.table.findByPk(options.id)
        .then(stock => stock.decrement('_qty', {by: options.qty}))
        .then(stock => resolve(stock.qty))
        .catch(err => reject(err));
    }),
    adjust: (options = {}) => new Promise((resolve, reject) => {
        if (String(options.adjustment._type).toLowerCase() === 'count') {
            options.m.stock.findOne({where: {stock_id: options.adjustment.stock_id}})
            .then(stock => {
                if (stock) {
                    options.adjustment._variance = options.adjustment._qty - stock._qty
                    options.m.stock.update(
                        {_qty: options.adjustment._qty},
                        {where: {stock_id: options.adjustment.stock_id}}
                    )
                    .then(results => {
                        options.m.adjusts.create(options.adjustment)
                        .then(results => resolve(results))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                } else reject(new Error('Stock not found'))
            })
            .catch(err => reject(err));
        } else if (String(options.adjustment._type).toLowerCase() === 'scrap') {
            options.m.stock.findOne({where: {stock_id: options.adjustment.stock_id}})
            .then(stock => {
                if (stock) {
                    options.adjustment._variance = options.adjustment._qty - stock._qty
                    options.m.stock.findByPk(options.adjustment.stock_id)
                    .then(stock => stock.decrement('_qty', {by: options.adjustment._qty}))
                    .then(results => {
                        options.m.adjusts.create(options.adjustment)
                        .then(results => resolve(results))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                } else reject(new Error('Stock not found'))
            })
            .catch(err => reject(err));
        } else reject(new Error('Invalid adjustment type'));
    })
};