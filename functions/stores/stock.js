module.exports = function (m, fn) {
    fn.stocks = {};
    fn.stocks.find = function (options = {}) {
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
                            fn.locations.find_or_create(options.location)
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

    fn.stocks.get_all = function (query) {
        return m.stocks.findAndCountAll({
            where: query.where,
            include: [
                fn.inc.stores.size(),
                fn.inc.stores.location()
            ],
            ...fn.pagination(query)
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
            Promise.all([
                fn.sizes.get({size_id: size_id}),
                m.locations.findOrCreate({where: {location: location}})
            ])
            .then(([size, [location, created]]) => {
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
        });
    };
    fn.stocks.scrap = function (stock_id, details, user_id) {
        function check_stock() {
            return new Promise((resolve, reject) => {
                m.stocks.findOne({
                    where: {stock_id: stock_id},
                    include: [m.sizes]
                })
                .then(stock => {
                    if (stock.size.has_nsns && !details.nsn_id) {
                        reject(new Error("No valid NSN submitted"));
    
                    } else {
                        resolve(stock);

                    };
                })
                .catch(reject);
            });
        };
        function create_scrap_line(stock) {
            return new Promise((resolve, reject) => {
                fn.scraps.get_or_create(stock.size.supplier_id)
                .then(scrap => {
                    fn.scraps.lines.create(
                        scrap.scrap_id,
                        stock.size_id,
                        details
                    )
                    .then(scrap_line => resolve({_table: 'scrap_lines', id: scrap_line.line_id}))
                    .catch(reject);
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            check_stock()
            .then(stock => {
                Promise.all([
                    fn.stocks.decrement(stock, details.qty),
                    create_scrap_line(stock)
                ])
                
                .then(([stock_link, scrap_line_link]) => {
                    fn.actions.create([
                        `STOCK | SCRAPPED | Decreased by ${details.qty}. New qty: ${Number(stock.qty - details.qty)}`,
                        user_id,
                        [stock_link, scrap_line_link]
                    ])
                    .then(action => resolve(true));
                })
                .catch(reject);
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
        if (!counts) {
            return Promise.reject(new Error('No details'));

        } else {
            return new Promise((resolve, reject) => {
                let actions = [];
                counts.filter(a => a.qty).forEach(count => {
                    actions.push(fn.stocks.count(count.stock_id, count.qty, user_id))
                })
                Promise.allSettled(actions)
                .then(fn.log_rejects)
                .then(results => resolve(true))
                .catch(reject);
    
            });

        };
    };
    fn.stocks.increment = function (stock, qty) {
        return new Promise((resolve, reject) => {
            stock.increment('qty', {by: qty})
            .then(result => {
                if (result) {
                    resolve({_table: 'stocks', id: stock.stock_id});

                } else {
                    reject(new Error('Stock not incremented'));

                };
            })
            .catch(reject);
        });
    };
    fn.stocks.decrement = function (stock, qty) {
        return new Promise((resolve, reject) => {
            stock.decrement('qty', {by: qty})
            .then(result => {
                if (result) {
                    resolve({_table: 'stocks', id: stock.stock_id});

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
                    options.qty
                )
                .then(stock_link => {
                    fn.actions.create([
                        `STOCK | RECEIVED | Qty: ${options.qty}`,
                        options.user_id,
                        [stock_link].concat(options.action_links || [])
                    ])
                    .then(action => resolve(true));
                })
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
        function check_from_stock() {
            return new Promise((resolve, reject) => {
                fn.stocks.get_by_ID(stock_id_from)
                .then(stock => {
                    if (qty > stock.qty) {
                        reject(new Error('Transfer quantity is greater than stock quantity'));

                    } else {
                        resolve(stock);

                    };
                })
                .catch(reject);
            });
        };
        function check_to_stock(stock_from) {
            return new Promise((resolve, reject) => {
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
                                location_id: location_to.location_id,
                                size_id:     stock_from .size_id
                            }
                        })
                        .then(([stock_to, created]) => resolve([stock_from, stock_to]))
                        .catch(reject);

                    };
                })
                .catch(reject);
            });
        };
        function transfer_stock([stock_from, stock_to]) {
            return new Promise((resolve, reject) => {
                Promise.all([
                    fn.stocks.decrement(stock_from, qty),
                    fn.stocks.increment(stock_to,   qty)
                ])
                .then(([stock_link_from, stock_link_to]) => {
                    resolve([
                        `STOCK | TRANSFER | From: ${stock_from.location.location} to: ${stock_to.location.location} | Qty: ${qty}`,
                        user_id,
                        [
                            stock_link_from,
                            stock_link_to
                        ]
                    ]);
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            check_from_stock()
            .then(check_to_stock)
            .then(transfer_stock)
            .then(fn.actions.create)
            .then(result => resolve(true))
            .catch(reject);
        });
    };
};