module.exports = function (m, fn) {
    fn.stocks = {};
    fn.stocks.get = function (options = {}) {
        return new Promise((resolve, reject) => {
            if (
                options.stock_id ||
                (
                    options.size_id && 
                    (
                        options.location ||
                        options.location_id
                    )
                )
            ) {
                if (options.stock_id) {
                    m.stocks.findOne({
                        where: {stock_id: options.stock_id},
                        include: [m.locations]
                    })
                    .then(stock => {
                        if (stock) resolve(stock)
                        else reject(new Error('Stock not found'));
                    })
                    .catch(err => reject(err));
                } else if (options.size_id) {
                    fn.sizes.get(options.size_id)
                    .then(size => {
                        if (options.location_id) {
                            m.stocks.findOrCreate({
                                where: {
                                    size_id:     size.size_id,
                                    location_id: options.location_id
                                },
                                include: [m.locations]
                            })
                            .then(([stock, created]) => resolve(stock))
                            .catch(err => reject(err));
                        } else if (options.location) {
                            fn.locations.get({location: options.location})
                            .then(location_id => {
                                m.stocks.findOrCreate({
                                    where: {
                                        size_id:     size.size_id,
                                        location_id: location_id
                                    },
                                    include: [m.locations]
                                })
                                .then(([stock, created]) => resolve(stock))
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        } else reject(new Error('No location details submitted'));
                    })
                    .catch(err => reject(err));
                } else reject(new Error('No size or stock ID submitted'));
            } else reject(new Error('No size, location or stock ID submitted'));
        });
    };
    fn.stocks.scrap = function (stock_id, details, user_id) {
        return new Promise((resolve, reject) => {
            m.stocks.findOne({
                where: {stock_id: stock_id},
                include: [m.sizes]
            })
            .then(stock => {
                if (stock.size.has_nsns && !details.nsn_id) reject(new Error("No valid NSN submitted"))
                else {
                    stock.decrement('qty', {by: details.qty})
                    .then(result => {
                        fn.scraps.get({supplier_id: stock.size.supplier_id})
                        .then(scrap => {
                            fn.scraps.lines.add(
                                scrap.scrap_id,
                                stock.size_id,
                                details
                            )
                            .then(result => {
                                fn.actions.create(
                                    `STOCK | SCRAPPED | Decreased by ${details.qty}. New qty: ${Number(stock.qty - details.qty)}`,
                                    user_id,
                                    [{table: 'stocks', id: stock.stock_id}]
                                )
                                .then(results => resolve(true));
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.stocks.count = function (stock_id, qty, user_id) {
        return new Promise((resolve, reject) => {
            fn.stocks.get({stock_id: stock_id})
            .then(stock => {
                let variance = qty - stock.qty;
                fn.update(stock, {qty: qty})
                .then(result => {
                    fn.actions.create(
                        `COUNT | ${(variance < 0 ? 
                            `Decreased by ${variance}. New qty: ${qty}` : (variance > 0 ? 
                            `Increased by ${variance}. New qty: ${qty}` : 
                            `No variance. Qty: ${qty}`
                            )
                        )}`,
                        user_id,
                        [{table: 'stocks', id: stock.stock_id}]
                    )
                    .then(results => resolve(true));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.stocks.receive = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.stocks.get(options.stock)
            .then(stock => {
                stock.increment('qty', {qty: options.qty})
                .then(result => {
                    if (!result) reject(new Error('Stock not incremented'))
                    else {
                        fn.actions.create(
                            `STOCK | RECEIVED | Qty: ${options.qty}`,
                            options.user_id,
                            [
                                {table: 'stocks', id: stock.stock_id}
                            ].concat(options.action_links || [])
                        )
                        .then(result => resolve(true));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    fn.stocks.transfer = function (stock_id_from, location_to, qty, user_id) {
        return new Promise((resolve, reject) => {
            fn.stocks.get(stock_id_from)
            .then(stock_from => {
                if (qty > stock_from.qty) reject(new Error('Transfer quantity is greater than stock quantity'))
                else {
                    m.locations.findOrCreate({where: {location: location_to}})
                    .then(([location, created]) => {
                        if (
                            stock_from.location_id       === location.location_id ||
                            stock_from.location.location === location.location
                        ) {
                            reject(new Error('Transfer to and from locations are the same'))
                        } else {
                            m.stocks.findOrCreate({
                                where:    {
                                    location_id: location.location_id,
                                    size_id:     stock_from.size_id
                                }
                            })
                            .then(([stock_to, created]) => {
                                Promise.all([
                                    stock_from.decrement('qty', {by: qty}),
                                    stock_to  .increment('qty', {by: qty})
                                ])
                                .then(result => {
                                    fn.actions.create(
                                        `STOCK | TRANSFER | From: ${stock_from.location.location} to: ${location.location} | Qty: ${qty}`,
                                        user_id,
                                        [
                                            {table: 'stocks', id: stock_from.stock_id},
                                            {table: 'stocks', id: stock_to  .stock_id}
                                        ]
                                    )
                                    .then(result => resolve(true));
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
};