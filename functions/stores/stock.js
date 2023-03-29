module.exports = function (m, fn) {
    fn.stocks = {};
    fn.stocks.find = function (options = {}) {
        console.log(options);
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
                        if (stock) {
                            resolve(stock);

                        } else {
                            reject(new Error('Stock not found'));
                            
                        };
                    })
                    .catch(reject);

                } else if (options.size_id) {
                    fn.sizes.get({size_id: options.size_id})
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
                            .catch(reject);
                            
                        } else if (options.location) {
                            fn.locations.find_or_create({location: options.location})
                            .then(location => {
                                m.stocks.findOrCreate({
                                    where: {
                                        size_id:     size.size_id,
                                        location_id: location.location_id
                                    },
                                    include: [m.locations]
                                })
                                .then(([stock, created]) => resolve(stock))
                                .catch(reject);
                            })
                            .catch(reject);

                        } else {
                            reject(new Error('No location details submitted'));
                        
                        };
                    })
                    .catch(reject);

                } else {
                    reject(new Error('No size or stock ID submitted'));

                };
            } else {
                reject(new Error('No size, location or stock ID submitted'));
            };
        });
    };
    fn.stocks.get = function (where) {
        return fn.get(
            m.stocks,
            where,
            [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ]
        )
    };

    fn.stocks.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.stocks.findAndCountAll({
                where: where,
                include: [
                    fn.inc.stores.size(),
                    fn.inc.stores.location()
                ],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.stocks.sum = function (where) {return m.stocks.sum('qty', {where: where})};

    fn.stocks.get_by_ID = function (stock_id) {
        return new Promise((resolve, reject) => {
            m.stocks.findOne({
                where: {stock_id: stock_id},
                include: [m.locations]
            })
            .then(stock => {
                if (stock) {
                    resolve(stock);

                } else {
                    reject(new Error('Stock not found'));
                    
                };
            })
            .catch(reject);
        });
    };
    fn.stocks.create = function (size_id, location) {
        return new Promise((resolve, reject) => {
            fn.sizes.get({size_id: size_id})
            .then(size => {
                m.locations.findOrCreate({where: {location: location}})
                .then(([location, created]) => {
                    m.stocks.findOrCreate({
                        where: {
                            size_id:     size.size_id,
                            location_id: location.location_id
                        }
                    })
                    .then(([stock, created]) => resolve(true))
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.stocks.scrap = function (stock_id, details, user_id) {
        return new Promise((resolve, reject) => {
            m.stocks.findOne({
                where: {stock_id: stock_id},
                include: [m.sizes]
            })
            .then(stock => {
                if (stock.size.has_nsns && !details.nsn_id) {
                    reject(new Error("No valid NSN submitted"));

                } else {
                    fn.stocks.decrement(stock, details.qty)
                    .then(result => {
                        fn.scraps.get_or_create(stock.size.supplier_id)
                        .then(scrap => {
                            fn.scraps.lines.create(
                                scrap.scrap_id,
                                stock.size_id,
                                details
                            )
                            .then(result => {
                                fn.actions.create([
                                    `STOCK | SCRAPPED | Decreased by ${details.qty}. New qty: ${Number(stock.qty - details.qty)}`,
                                    user_id,
                                    [{_table: 'stocks', id: stock.stock_id}]
                                ])
                                .then(results => resolve(true));
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);

                };
            })
            .catch(reject);
        });
    };
    fn.stocks.count = function (stock_id, qty, user_id) {
        function update_stock(stock) {
            return new Promise((resolve, reject) => {
                const variance = qty - stock.qty;
                fn.update(stock, {qty: qty})
                .then(result => resolve([
                    `COUNT | ${(variance < 0 ? 
                        `Decreased by ${variance}. New qty: ${qty}` : (variance > 0 ? 
                        `Increased by ${variance}. New qty: ${qty}` : 
                        `No variance. Qty: ${qty}`
                        )
                    )}`,
                    user_id,
                    [{_table: 'stocks', id: stock.stock_id}]
                ]))
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            fn.stocks.get_by_ID(stock_id)
            .then(update_stock)
            .then(fn.actions.create)
            .then(results => resolve(true))
            .catch(reject);
        });
    };
    fn.stocks.count_bulk = function (counts, user_id) {
        return new Promise((resolve, reject) => {
            if (!counts) {
                reject(new Error('No details'));
    
            } else {
                let actions = [];
                counts.filter(a => a.qty).forEach(count => {
                    actions.push(fn.stocks.count(count.stock_id, count.qty, user_id))
                })
                Promise.allSettled(actions)
                .then(fn.log_rejects)
                .then(results => resolve(true))
                .catch(reject);
    
            };
        });
    };
    fn.stocks.increment = function (stock, qty, action = null) {//{text: '', links: [], user_id: user_id}) {
        return new Promise((resolve, reject) => {
            stock.increment('qty', {by: qty})
            .then(result => {
                if (result) {
                    if (action) {
                        fn.actions.create([
                            action.text,
                            action.user_id,
                            [
                                {_table: 'stocks', id: stock.stock_id}
                            ].concat(action.links || [])
                        ])
                        .then(result => resolve(true));

                    } else {
                        resolve(true);

                    };

                } else {
                    reject(new Error('Stock not incremented'));

                };
            })
            .catch(reject);
        });
    };
    fn.stocks.decrement = function (stock, qty, action = null) {
        return new Promise((resolve, reject) => {
            stock.decrement('qty', {by: qty})
            .then(result => {
                if (result) {
                    if (action) {
                        fn.actions.create([
                            action.text,
                            action.user_id,
                            [
                                {_table: 'stocks', id: stock.stock_id}
                            ].concat(action.links || [])
                        ])
                        .then(result => resolve(true));

                    } else {
                        resolve(true);

                    };

                } else {
                    reject(new Error('Stock not decremented'));

                };
            })
            .catch(reject);
        });
    };
    fn.stocks.receive = function (options = {}) {
        return new Promise((resolve, reject) => {
            fn.stocks.find(options.stock)
            .then(stock => {
                fn.stocks.increment(
                    stock,
                    options.qty, 
                    {
                        text:    `STOCK | RECEIVED | Qty: ${options.qty}`,
                        links:   options.action_links || [],
                        user_id: options.user_id
                    }
                )
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.stocks.return = function (stock_id, qty) {
        return new Promise((resolve, reject) => {
            fn.stocks.get_by_ID(stock_id)
            .then(stock => {
                fn.stocks.increment(stock, qty)
                .then(result => resolve({_table: 'stocks', id: stock_id}))
                .catch(reject);
            })
            .catch(reject);
        });
    };
    fn.stocks.transfer = function (stock_id_from, location_to, qty, user_id) {
        return new Promise((resolve, reject) => {
            fn.stocks.get_by_ID(stock_id_from)
            .then(stock_from => {
                if (qty > stock_from.qty) {
                    reject(new Error('Transfer quantity is greater than stock quantity'));

                } else {
                    m.locations.findOrCreate({where: {location: location_to}})
                    .then(([location, created]) => {
                        if (
                            stock_from.location_id       === location.location_id ||
                            stock_from.location.location === location.location
                        ) {
                            reject(new Error('Transfer to and from locations are the same'));

                        } else {
                            m.stocks.findOrCreate({
                                where:    {
                                    location_id: location.location_id,
                                    size_id:     stock_from.size_id
                                }
                            })
                            .then(([stock_to, created]) => {
                                Promise.all([
                                    fn.stocks.decrement(stock_from, qty),
                                    fn.stocks.increment(stock_to,   qty)
                                ])
                                .then(([decrement_result, increment_result]) => {
                                    fn.actions.create([
                                        `STOCK | TRANSFER | From: ${stock_from.location.location} to: ${location.location} | Qty: ${qty}`,
                                        user_id,
                                        [
                                            {_table: 'stocks', id: stock_from.stock_id},
                                            {_table: 'stocks', id: stock_to  .stock_id}
                                        ]
                                    ])
                                    .then(result => resolve(true));
                                })
                                .catch(reject);
                            })
                            .catch(reject);
                        };
                    })
                    .catch(reject);
                };
            })
            .catch(reject);
        });
    };
};