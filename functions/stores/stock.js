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
                        return fn.locations.get({location: options.location})
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
    fn.stocks.adjust = function (stock_id, type, qty, user_id) {
        return new Promise((resolve, reject) => {
            return fn.stocks.get({stock_id: stock_id})
            .then(stock => {
                let action = null, action_text = '', variance = 0;
                switch (String(type).toLowerCase()) {
                    case 'count':
                        variance = qty - stock.qty;
                        action = fn.update(stock, {qty: qty});
                        action_text = `COUNT | ${(variance < 0 ? 
                            `Decreased by ${variance}. New qty: ${qty}` : (variance > 0 ? 
                            `Increased by ${variance}. New qty: ${qty}` : 
                            `No variance. Qty: ${qty}`
                            )
                        )}`;
                        break
                    case 'scrap':
                        variance = 0 - qty;
                        action = fn.decrement(stock, qty);
                        action_text = `SCRAP | Decreased by ${qty}. New qty: ${Number(stock.qty - qty)}`
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
                            user_id,
                            [{table: 'stocks', id: stock.stock_id}]
                        )
                        .then(results => resolve(true))
                        .catch(err => resolve(false));
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
                            `RECEIPT | Qty: ${options.qty}`,
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