module.exports = function (m, fn) {
    fn.stocks = {};

    fn.stocks.get = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (options.stock_id) {
                return fn.get('stocks', {stock_id: options.stock_id})
                .then(stock => resolve(stock))
                .catch(err => reject(err));
            } else if (options.size_id) {
                return fn.get('sizes', {size_id: options.size_id})
                .then(size => {
                    if (options.location_id) {
                        return m.stocks.findOrCreate({
                            where: {
                                size_id:     size.size_id,
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
                                    size_id:     size.size_id,
                                    location_id: location_id
                                }
                            })
                            .then(([stock, created]) => resolve(stock))
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    } else reject(new Error('No location details submitted'));
                })
                .catch(err => reject(err));
            } else reject(new Error('No size or stock ID submitted'));
        });
    };
    fn.stocks.adjust = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.stocks.get({stock_id: options.adjustment.stock_id})
            .then(stock => {
                let action = null, action_text = '';
                switch (String(options.adjustment.type).toLowerCase()) {
                    case 'count':
                        action = fn.update(stock, {qty: options.adjustment.qty});
                        action_text = `COUNT | ${(variance < 0 ? 
                            `Decreased by ${variance}. New qty: ${options.adjustment.qty}` : (variance > 0 ? 
                            `Increased by ${variance}. New qty: ${options.adjustment.qty}` : 
                            `No variance. Qty: ${options.adjustment.qty}`
                            )
                        )}`;
                        break
                    case 'scrap':
                        action = fn.decrement(stock, options.adjustment.qty);
                        action_text = `SCRAP | Decreased by ${options.adjustment.qty}. New qty: ${Number(stock.qty - options.adjustment.qty)}`
                        break
                    default:
                        break
                };
                if (!action) reject(new Error('Invalid adjustment type'))
                else {
                    return action
                    .then(result => {
                        return fn.actions.create(
                            action_text,
                            options.user_id,
                            [{table: 'stocks', id: stock.stock_id}]
                        )
                        .then(results => resolve(results))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.stocks.receive = function (options = {}) {
        return new Promise((resolve, reject) => {
            return fn.stocks.get(options.stock)
            .then(stock => {
                return fn.increment(stock, options.qty)
                .then(result => {
                    if (!result) reject(new Error('Stock not incremented'))
                    else {
                        fn.actions.create(
                            `RECEIPT | Qty: ${qty}`,
                            options.user_id,
                            [
                                {table: 'stocks', id: stock.stock_id}
                            ].concat(options.action_links || [])
                        )
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