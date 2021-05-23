module.exports = function (m, stock) {
    stock.increment = function (options = {}) {
        return new Promise((resolve, reject) => {
            options.table.findByPk(options.id)
            .then(stock => stock.increment(options.column || '_qty', {by: options.by}))
            .then(stock => resolve(stock.qty - options.by))
            .catch(err => reject(err));
        });
    };
    stock.decrement = (options = {}) => {
        return new Promise((resolve, reject) => {
            options.table.findByPk(options.id)
            .then(stock => stock.decrement(options.column || '_qty', {by: options.by}))
            .then(stock => resolve(stock.qty - options.by))
            .catch(err => reject(err));
        });
    };
    stock.adjust = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (String(options.adjustment._type).toLowerCase() === 'count') {
                m.stock.findOne({where: {stock_id: options.adjustment.stock_id}})
                .then(stock => {
                    if (stock) {
                        options.adjustment._variance = options.adjustment._qty - stock._qty
                        m.stock.update(
                            {_qty: options.adjustment._qty},
                            {where: {stock_id: options.adjustment.stock_id}}
                        )
                        .then(results => {
                            m.adjusts.create(options.adjustment)
                            .then(results => resolve(results))
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    } else reject(new Error('Stock not found'))
                })
                .catch(err => reject(err));
            } else if (String(options.adjustment._type).toLowerCase() === 'scrap') {
                m.stock.findOne({where: {stock_id: options.adjustment.stock_id}})
                .then(stock => {
                    if (stock) {
                        options.adjustment._variance = options.adjustment._qty - stock._qty
                        m.stock.findByPk(options.adjustment.stock_id)
                        .then(stock => stock.decrement('_qty', {by: options.adjustment._qty}))
                        .then(results => {
                            m.adjusts.create(options.adjustment)
                            .then(results => resolve(results))
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    } else reject(new Error('Stock not found'))
                })
                .catch(err => reject(err));
            } else reject(new Error('Invalid adjustment type'));
        });
    };
};