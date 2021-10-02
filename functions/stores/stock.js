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

    fn.stocks.get = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.stock_id) {
                return fn.get('stocks', {stock_id: options.stock_id})
                .then(stock => resolve(stock))
                .catch(err => reject(err));
            } else if (options.size_id) {
                if (options.location_id) {
                    return m.stocks.findOrCreate({
                        where: {
                            size_id:     options.size_id,
                            location_id: options.location_id
                        }
                    })
                    .then(([stock, created]) => resolve(stock))
                    .catch(err => reject(err));
                } else if (options.location) {
                    return m.locations.get({location: options.location})
                    .then(location_id => {
                        return m.stocks.findOrCreate({
                            where: {
                                size_id:     options.size_id,
                                location_id: location_id
                            }
                        })
                        .then(([stock, created]) => resolve(stock))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                } else reject(new Error('No location details submitted'));
            } else reject(new Error('No size or stock ID submitted'));
        });
    };
    fn.stocks.receive = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.stocks.get(options.stock)
            .then(stock => {
                return stock.increment('qty', {by: options.qty})
                .then(result => {
                    if (!result) reject(new Error('Stock not incremented'))
                    else {
                        fn.actions.create({
                            action:  `Received | Qty: ${qty}`,
                            user_id: options.user_id,
                            links:   [{table: 'stocks', id: stock.stock_id}]
                                     .concat(options.action_links || [])
                        })
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};