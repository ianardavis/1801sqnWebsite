module.exports = function (m, fn) {
    fn.stocks = {};
    fn.stocks.increment = function (options = {}) {
        return new Promise((resolve, reject) => {
            options.table.findByPk(options.id)
            .then(stock => stock.increment(options.column || 'qty', {by: options.by}))
            .then(stock => resolve(stock.qty - options.by))
            .catch(err => reject(err));
        });
    };
    fn.stocks.decrement = (options = {}) => {
        return new Promise((resolve, reject) => {
            options.table.findByPk(options.id)
            .then(stock => stock.decrement(options.column || '_qty', {by: options.by}))
            .then(stock => resolve(stock.qty - options.by))
            .catch(err => reject(err));
        });
    };
    fn.stocks.adjust = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (String(options.adjustment._type).toLowerCase() === 'count') {
                return fn.get(
                    'stocks',
                    {stock_id: options.adjustment.stock_id}
                )
                .then(stock => {
                    options.adjustment.variance = options.adjustment._qty - stock.qty
                    m.stock.update(
                        {qty: options.adjustment.qty},
                        {where: {stock_id: options.adjustment.stock_id}}
                    )
                    .then(results => {
                        m.adjusts.create(options.adjustment)
                        .then(results => resolve(results))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            } else if (String(options.adjustment._type).toLowerCase() === 'scrap') {
                return fn.get(
                    'stocks',
                    {stock_id: options.adjustment.stock_id}
                )
                .then(stock => {
                    options.adjustment._variance = options.adjustment._qty - stock._qty
                    m.stock.findByPk(options.adjustment.stock_id)
                    .then(stock => stock.decrement('_qty', {by: options.adjustment._qty}))
                    .then(results => {
                        m.adjusts.create(options.adjustment)
                        .then(results => resolve(results))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            } else reject(new Error('Invalid adjustment type'));
        });
    };
};