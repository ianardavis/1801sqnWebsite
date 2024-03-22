module.exports = function ( m, fn ) {
    fn.scraps.lines.find = function (where) {
        return fn.find(
            m.scrap_lines,
            where,
            [
                fn.inc.stores.serial(),
                fn.inc.stores.size(),
                fn.inc.stores.scrap({
                    include: [
                        fn.inc.stores.supplier()
                    ]
                })
            ]
        );
    };
    fn.scraps.lines.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            let where = fn.buildQuery(query);
            m.scrap_lines.findAndCountAll({
                where: where,
                include: [
                    fn.inc.stores.size_filter(query),
                    fn.inc.stores.nsn(),
                    fn.inc.stores.serial(),
                    fn.inc.stores.scrap()
                ],
                ...fn.pagination( query )
            })
            .then(results => resolve(results))
            .catch( reject );
        })
    };
    
    fn.scraps.lines.create = function (scrap_id, size_id, options = {}) {
        function checkNSN(nsn_id, size_id) {
            return new Promise( ( resolve, reject ) => {
                m.nsns.findByPk(nsn_id)
                .then(nsn => {
                    if (!nsn) {
                        reject(new Error('NSN not found'));
    
                    } else if (nsn.size_id !== size_id) {
                        reject(new Error('NSN not for this size'));
    
                    } else {
                        resolve(true);
    
                    };
                })
                .catch( reject );
            });
        };
        function checkSerial(serial_id, size_id) {
            return new Promise( ( resolve, reject ) => {
                fn.serials.find({serial_id: serial_id})
                .then(serial => {
                    if (serial.size_id !== size_id) {
                        reject(new Error('Serial not for this size'));
    
                    } else {
                        resolve(true);
    
                    };
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            Promise.all([]
                .concat((options.nsn_id    ? [checkNSN(   options.nsn_id,    size_id)] : []))
                .concat((options.serial_id ? [checkSerial(options.serial_id, size_id)] : []))
            )
            .then(pre_checks => {
                m.scrap_lines.findOrCreate({
                    where: {
                        scrap_id: scrap_id,
                        size_id:  size_id,
                        ...(options.nsn_id    ? {nsn_id:    options.nsn_id}    : {}),
                        ...(options.serial_id ? {serial_id: options.serial_id} : {})
                    },
                    defaults: {
                        qty: options.qty
                    }
                })
                .then(([line, created]) => {
                    if (created) {
                        resolve(line);

                    } else {
                        line.increment('qty', {by: options.qty})
                        .then(result => {
                            if (result) {
                                resolve(line);

                            } else {
                                reject(new Error('Existing scrap line not incremented'));

                            };
                        })
                        .catch( reject );
                        
                    };
                })
                .catch( reject );
            })
            .catch(err => {
                console.error(err);
                reject(new Error('Error doing pre scrap checks'));
            });
        });
    };
    
    fn.scraps.lines.cancel = function (line_id, qty, location, user_id) {
        function cancelSerialScrap(line, location) {
            return new Promise( ( resolve, reject ) => {
                if (line.serial) {
                    if (line.serial.issue || line.serial.location) {
                        reject(new Error('Serial is issued or in stock'));
    
                    } else {
                        fn.locations.findOrCreate(location)
                        .then(new_location => {
                            fn.update(line.serial, {location_id: new_location.location_id})
                            .then(result => resolve(line.scrap_id))
                            .catch( reject );
                        })
                        .catch( reject );
    
                    };
    
                } else {
                    reject(new Error('Serial not found'));
    
                };
            });
        };
        function cancelStockScrap(line, location, qty, user_id) {
            return new Promise( ( resolve, reject ) => {
                if (line.qty >= qty) {
                    line.decrement('qty', {by: qty})
                    .then(result => {
                        fn.stocks.find({size_id: line.size_id, location: location})
                        .then(stock => {
                            fn.stocks.increment(
                                stock,
                                qty
                            )
                            .then(stock_link => {
                                fn.actions.create([
                                    `SCRAP LINE | CANCELLED | Qty: ${qty}`,
                                    user_id,
                                    [{_table: 'scrap_lines', id: line.line_id}].concat([stock_link])
                                ])
                                .then(action => resolve(line.scrap_id));
                            })
                            .catch( reject );
                        })
                        .catch( reject );
                    })
                    .catch( reject );
    
                } else {
                    reject(new Error('Cancel quantity is greater than line quantity'));
    
                };
            });
        };
        return new Promise( ( resolve, reject ) => {
            if (location) {
                fn.scraps.lines.find({line_id: line_id})
                .then(line => {
                    if (line.size.has_serials) {
                        cancelSerialScrap(line, location)
                        .then(scrap_id => resolve(scrap_id))
                        .catch( reject );
    
                    } else {
                        cancelStockScrap(line, location, qty, user_id)
                        .then(scrap_id => resolve(scrap_id))
                        .catch( reject );
    
                    };
                })
                .catch( reject );

            } else {
                reject(new Error('No location specified'));

            };
        });
    };

    fn.scraps.lines.update = function (lines, user_id) {
        function cancelLines(lines, user_id) {
            return new Promise( ( resolve, reject ) => {
                if (lines && lines.length > 0) {
                    let actions = [];
                    lines.forEach(line => {
                        actions.push(fn.scraps.lines.cancel(line.line_id, line.qty, line.location, user_id));
                    });
                    Promise.allSettled(actions)
                    .then(results => {
                        let scrap_ids = [];
                        results.filter(e => e.status === 'fulfilled').forEach(result => {
                            if (!scrap_ids.includes(result.value)) scrap_ids.push(result.value);
                        });
                        resolve(scrap_ids);
                    })
                    .catch( reject );
    
                } else {
                    reject(new Error('No lines to cancel'));
    
                };
            });
        };
        function checkScrap(scrap_id, user_id) {
            return new Promise( ( resolve, reject ) => {
                fn.scraps.cancel_check(scrap_id)
                .then(scrap => {
                    fn.scraps.cancel(scrap_id, user_id)
                    .then(result => resolve(true))
                    .catch( reject );
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            cancelLines(lines.filter(e => e.status === '0'), user_id)
            .then(scrap_ids => {
                let checks = [];
                scrap_ids.forEach(scrap_id => {
                    checks.push(
                        checkScrap(scrap_id, user_id)
                    );
                });
                Promise.allSettled(checks)
                .then(results => resolve(true))
                .catch( reject );
            })
            .catch( reject );
        });
    };
};