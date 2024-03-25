module.exports = function ( m, fn ) {
    fn.loancards.lines.find = function (where, include = []) {
        return fn.find(
            m.loancard_lines,
            where,
            include
        );
    };
    fn.loancards.lines.findAll = function (where, options) {
        return new Promise( ( resolve, reject ) => {
            m.loancard_lines.findAndCountAll({
                where: where,
                include: [
                    m.issues,
                    fn.inc.stores.size(),
                    fn.inc.users.user(),
                    fn.inc.stores.loancard({
                        ...options.loancard_where || {},
                        include: [
                            fn.inc.users.user(),
                            fn.inc.users.user({as: 'user_loancard'})
                        ]
                    })
                ],
                ...options.pagination || {}
            })
            .then(resolve)
            .catch( reject );
        });
    };
    
    fn.loancards.lines.process = function (site_id, lines, user_id) {
        function actionLines() {
            return new Promise( ( resolve, reject ) => {
                let actions = [];
    
                lines
                .filter (e => e.status === '3')
                .forEach(line => {
                    actions.push(fn.loancards.lines.return(line, user_id));
                });
    
                lines
                .filter (e => e.status === '0')
                .forEach(line => {
                    actions.push(fn.loancards.lines.cancel(line, user_id));
                });
    
                Promise.allSettled(actions)
                .then(fn.checkResults)
                .then(resolve)
                .catch( reject );
            });
        };
        function checkLoancards(loancard_ids) {
            function checkLoancardLines(loancard_id) {
                function getLines() {
                    return m.loancard_lines.findAll({
                        where: {
                            loancard_id: loancard_id,
                            status: 2
                        },
                        include: [{
                            model: m.issues,
                            where: {status: 4},
                            required: false
                        }]
                    });
                };
                function checkLines(lines) {
                    function close_loancard_line(line) {
                        return new Promise( ( resolve, reject ) => {
                            fn.update(line, {status: 3})
                            .then(result => {
                                fn.actions.create([
                                    'LOANCARD LINE | CLOSED',
                                    user_id,
                                    [{_table: 'loancard_lines', id: line.line_id}]
                                ])
                                .then(resolve);
                            })
                            .catch( reject );
                        });
                    };

                    return new Promise( ( resolve, reject ) => {
                        let actions = [];
                        lines.forEach(line => {
                            if (!line.issues || line.issues.length === 0) {
                                actions.push(close_loancard_line(line));
                            };
                        });
                        Promise.all(actions)
                        .then(results => resolve(loancard_id))
                        .catch( reject );
                    });
                };

                return new Promise( ( resolve, reject ) => {
                    getLines()
                    .then(checkLines)
                    .then(resolve)
                    .catch( reject );
                });
            };
            function checkLoancard(loancard_id) {
                function getLoancard() {
                    return m.loancards.findOne({
                        where: {loancard_id: loancard_id},
                        include: [{
                            model:    m.loancard_lines,
                            as:       'lines',
                            where:    {status: {[fn.op.or]: [1, 2]}},
                            required: false
                        }]
                    })
                };

                return new Promise( ( resolve, reject ) => {
                    getLoancard()
                    .then(loancard => {
                        if (!loancard.lines || loancard.lines.length === 0) {
                            if (loancard.status === 0) {
                                resolve(true);
        
                            } else if (loancard.status === 1) {
                                fn.loancards.cancel(site_id, loancard.loancard_id, user_id)
                                .then(resolve)
                                .catch( reject );
        
                            } else if (loancard.status === 2) {
                                fn.loancards.close(site_id, loancard.loancard_id, user_id)
                                .then(resolve)
                                .catch( reject );
        
                            } else if (loancard.status === 3) {
                                resolve(true);
        
                            } else {
                                reject(new Error('Unknown loancard status'));
        
                            };
                        } else {
                            resolve(true);
        
                        };
                    })
                    .catch( reject );
                });
            };

            return new Promise( ( resolve, reject ) => {
                let actions = [];
                loancard_ids.forEach(loancard_id => {
                    actions.push(new Promise( ( resolve, reject ) => {
                        checkLoancardLines(loancard_id)
                        .then(checkLoancard)
                        .then(resolve)
                        .catch( reject );
                    }));
                });
                Promise.allSettled(actions)
                .then(fn.checkResults)
                .then(results => resolve(true))
                .catch( reject );
            });
        };

        return new Promise( ( resolve, reject ) => {
            actionLines()
            .then(checkLoancards)
            .then(resolve)
            .catch( reject );
        });
    };

    fn.loancards.lines.create = function(site_id, loancard_id, issue, user_id, line) {
        function check_nsn(size) {
            return new Promise( ( resolve, reject ) => {
                if (size.has_nsns) {
                    if (line.nsn_id) {
                        fn.nsns.find({nsn_id: line.nsn_id})
                        .then(nsn => {
                            if (nsn.size_id !== size.size_id) {
                                reject(new Error('NSN is not for this size'));
    
                            } else {
                                resolve(nsn.nsn_id);
    
                            };
                        })
                        .catch( reject );
    
                    } else {
                        reject(new Error('No NSN ID submitted'));
    
                    };
                } else {
                    resolve(null);
    
                };
            });
        };
        function add_serial(size_id, nsn_id, loancard_id) {
            function check_serial(size_id, serial_id) {
                return new Promise( ( resolve, reject ) => {
                    if (!serial_id) {
                        reject(new Error('No Serial ID submitted'));
        
                    } else {
                        fn.serials.find({serial_id: serial_id})
                        .then(serial => {
                            if (serial.size_id !== size_id) {
                                reject(new Error('Serial # is not for this size'));
        
                            } else if (serial.issue_id) {
                                reject(new Error('This serial is already issued'));
        
                            } else if (!serial.location_id) {
                                reject(new Error('This serial is not in stock'));
        
                            } else {
                                resolve(serial);
        
                            };
                        })
                        .catch( reject );
                    };
                });
            };
            return new Promise( ( resolve, reject ) => {
                let actions = [];
                line.serials.forEach(serial => {
                    actions.push(new Promise( ( resolve, reject ) => {
                        check_serial(size_id, serial.serial_id)
                        .then(serial => {
                            m.loancard_lines.create({
                                loancard_id: loancard_id,
                                serial_id:   serial.serial_id,
                                size_id:     size_id,
                                nsn_id:      nsn_id,
                                qty:         1,
                                user_id:     user_id
                            })
                            .then(loancard_line => {
                                m.issue_loancard_lines.create({
                                    issue_id: issue.issue_id,
                                    line_id: loancard_line.line_id
                                })
                                .then(link_line => {
                                    Promise.all([
                                        fn.update(
                                            serial,
                                            {
                                                issue_id:    issue.issue_id,
                                                location_id: null
                                            }
                                        ),
                                        fn.update(issue, {status: 4})
                                    ])
                                    .then(([result1, result2]) => {
                                        fn.actions.create([
                                            'LOANCARD LINE | CREATED',
                                            user_id,
                                            [
                                                {_table: 'loancard_lines', id: loancard_line.line_id},
                                                {_table: 'serials',        id: serial.serial_id},
                                                {_table: 'issues',         id: issue.issue_id}
                                            ]
                                        ])
                                        .then(action => resolve(true));
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        reject(err);
                                    });
                                })
                                .catch( reject );
                            })
                            .catch( reject );
                        })
                        .catch( reject );
                    }));
                });
                Promise.allSettled(actions)
                .then(results => {
                    resolve(true);
                    // let resolve_obj = [];
                    // results.filter( fn.fulfilledOnly ).forEach(r => resolve_obj.concat(r));
                    // resolve(resolve_obj);
                })
                .catch( reject );
            });
        };
        function add_stock(size_id, nsn_id, loancard_id) {
            function check_stock(size_id, options = {}) {
                return new Promise( ( resolve, reject ) => {
                    if (!options.stock_id) {
                        reject(new Error('No stock ID submitted'));
        
                    } else {
                        fn.stocks.findByID(options.stock_id)
                        .then(stock => {
                            if (stock.size_id !== size_id) {
                                reject(new Error('Stock record is not for this size'));
        
                            } else {
                                resolve(stock);
        
                            };
                        })
                        .catch( reject );
                    };
                });
            };
            return new Promise( ( resolve, reject ) => {
                check_stock(size_id, line)
                .then(stock => {
                    m.loancard_lines.findOrCreate({
                        where: {
                            loancard_id: loancard_id,
                            status:      1,
                            size_id:     size_id,
                            nsn_id:      nsn_id
                        },
                        defaults: {user_id: user_id}
                    })
                    .then(([loancard_line, created]) => {
                        stock.decrement('qty', {by: line.qty})
                        .then(result => {
                            m.issue_loancard_lines.create({
                                issue_id: issue.issue_id,
                                line_id: loancard_line.line_id
                            })
                            .then(link_line => {
                                fn.update(issue, {status: 4})
                                .then(result => {
                                    fn.actions.create([
                                        `LOANCARD LINE | ${(created ? 'CREATED' : `INCREMENTED BY ${line.qty}`)}`,
                                        user_id,
                                        [
                                            {_table: 'stocks',         id: stock.stock_id},
                                            {_table: 'issues',         id: issue.issue_id},
                                            {_table: 'loancard_lines', id: loancard_line.line_id}
                                        ]
                                    ])
                                    .then(action => resolve(true));
                                })
                                .catch( reject );
                            })
                            .catch( reject );
                        })
                        .catch( reject );
                    })
                    .catch( reject );
                })
                .catch( reject );
            });
        };
        return new Promise( ( resolve, reject ) => {
            Promise.all([
                fn.loancards.find({loancard_id: loancard_id, site_id: site_id}),
                fn.sizes.get({size_id: issue.size_id})
            ])
            .then(([loancard, size]) => {
                check_nsn(size)
                .then(nsn_id => {
                    const action = (size.has_serials ? add_serial : add_stock);
                    action(size.size_id, nsn_id, loancard.loancard_id)
                    .then(resolve)
                    .catch( reject );
                })
                .catch( reject );
            })
            .catch( reject );
        })
    };

    function loancardLineQty(issues) {
        return issues.reduce((a, b) => a.qty + b.qty, 0);
    };
    fn.loancards.lines.cancel = function (return_line, user_id) {
        function checkLoancardLine(line_id) {
            return new Promise( ( resolve, reject ) => {
                fn.loancards.lines.find(
                    {line_id: line_id},
                    [m.issues, m.sizes, m.loancards]
                )
                .then(line => {
                    switch (line.status) {
                        case 0:
                            reject(new Error('This line has already been cancelled'));
                            break;
                        
                        case 1:
                            if (line.size) {
                                resolve(line);
        
                            } else {
                                reject(new Error('Size not found'));
        
                            };
                            break;

                        case 2:
                            reject(new Error('This line has already been completed'));
                            break;

                        case 3:
                            reject(new Error('This line has already been returned'));
                            break;
                    
                        default:
                            reject(new Error('Unknown line status'));
                            break;
                    };
                })
                .catch( reject );
            });
        };
        function returnStockToLocation(line) {
            return new Promise( ( resolve, reject ) => {
                if (line.serial_id) {
                    if (line.issues.length > 1) {
                        reject(new Error('Loancard line for serialised item has multiple issues assigned'));

                    } else {
                        fn.serials.return(line.serial_id, return_line.location)
                        .then(link => resolve([line, link]))
                        .catch( reject );

                    };
        
                } else {
                    fn.stocks.find({size_id: line.size_id, location: return_line.location})
                    .then(stock => {
                        fn.stocks.return(stock.stock_id, loancardLineQty(line.issues))
                        .then(link => resolve([line, link]))
                        .catch( reject );
                    })
                    .catch( reject );
                };
            });
        };
        function updateIssuesAndDestroyLink([line, stockReturnLink]) {
            return new Promise( ( resolve, reject ) => {
                let actions = [];
                line.issues.forEach(issue => {
                    actions.push(new Promise( ( resolve, reject ) => {
                        issue.issue_loancard_lines.destroy()
                        .then(result => {
                            if (result) {
                                fn.update(issue, {status: 2})
                                .then(result => resolve({_table: 'issues', id: issue.issue_id}))
                                .catch( reject );

                            } else {
                                reject(new Error('Link not destroyed'));

                            };
                        })
                        .catch( reject );
                    }));
                });
                Promise.all(actions)
                .then(issueLinks => resolve([line, issueLinks.concat(stockReturnLink)]))
                .catch( reject );
            });
        };
        function updateLine([line, links]) {
            return new Promise( ( resolve, reject ) => {
                fn.update(line, {status: 0})
                .then(result => resolve([
                    'LOANCARD LINE | CANCELLED',
                    user_id,
                    [
                        {_table: 'loancard_lines', id: line.line_id}
                    ].concat(links),
                    line.loancard_id
                ]))
                .catch( reject );
            });
        };

        return new Promise( ( resolve, reject ) => {
            checkLoancardLine(return_line.line_id)
            .then(returnStockToLocation)
            .then(updateIssuesAndDestroyLink)
            .then(updateLine)
            .then(fn.actions.create)
            .then(resolve)
            .catch( reject );
        });
    };

    fn.loancards.lines.return = function (options, user_id) {
        function checkLoancardLine() {
            return new Promise( ( resolve, reject ) => {
                fn.loancards.lines.find(
                    {line_id: options.line_id},
                    [
                        m.sizes, m.serials, m.loancards, 
                        {
                            model:    m.issues,
                            where:    {status: 4},
                            required: false,
                            order: [['createdAt', 'DESC']]
                        }
                    ]
                )
                .then(line => {
                    if (!line.issues || line.issues.length === 0) {
                        reject(new Error('No open issues for this loancard line'));

                    } else {
                        let qty = loancardLineQty(line.issues);
                        if (qty === 0) {
                            reject(new Error('Open quantity is 0'));

                        } else {
                            switch (line.status) {
                                case 0:
                                    reject(new Error('This line has already been cancelled'));
                                    break;
                            
                                case 1:
                                    reject(new Error('This line is still pending'));
                                    break;
                            
                                case 2:
                                    if (options.qty > qty) {
                                        reject(new Error('Return quantity is greater than open quantity'));
                
                                    } else if (line.size) {
                                        resolve(line);
                
                                    } else {
                                        reject(new Error('Size not found'));
                
                                    };
                                    break;
                            
                                case 3:
                                    reject(new Error('This line has already been returned'));
                                    break;
                            
                                default:
                                    reject(new Error('Unknown line status'));
                                    break;

                            };
                        };

                    };
                })
                .catch( reject );
            });
        };
        function checkReturnDestination(line) {
            return new Promise( ( resolve, reject ) => {
                if (options.scrap && options.scrap === '1') {
                    fn.scraps.findOrCreate(line.size.supplier_id)
                    .then(scrap => resolve([line, {scrap: scrap}]))
                    .catch( reject );
                    
                } else if (options.location) {
                    if (line.size.has_serials) {
                        if (line.serial) {
                            fn.locations.findOrCreate(options.location)
                            .then(location => resolve([
                                line, 
                                {
                                    serial: {
                                        serial:      line.serial,
                                        location_id: location.location_id
                                    }
                                }
                            ]))
                            .catch( reject );
    
                        } else {
                            reject(new Error('No valid serial # on loancard'));
    
                        };
                
                    } else {
                        fn.stocks.find({size_id: line.size_id, location: options.location})
                        .then(stock => resolve([line, {stock: stock}]))
                        .catch( reject );
    
                    };
    
                } else {
                    reject(new Error('No return destination specified'));
    
                };
            });
        };
        function returnStock([loancard_line, destination]) {
            function returnToStock() {
                return new Promise( ( resolve, reject ) => {
                    fn.stocks.return(destination.stock.stock_id, options.qty)
                    .then(link => resolve([loancard_line, link]))
                    .catch( reject );
                });
            };
            function returnSerial() {
                return new Promise( ( resolve, reject ) => {
                    fn.update(
                        destination.serial.serial,
                        {
                            issue_id: null,
                            location_id: destination.serial.location_id
                        }
                    )
                    .then(result => resolve([loancard_line, {_table: 'serials', id: destination.serial.serial.serial_id}]))
                    .catch( reject );
                });
            };
            function returnToScrap() {
                return new Promise( ( resolve, reject ) => {
                    fn.scraps.lines.create(
                        destination.scrap.scrap_id,
                        loancard_line.size_id,
                        {
                            serial_id: loancard_line.serial_id,
                            nsn_id:    loancard_line.nsn_id,
                            qty:       options.qty
                        }
                    )
                    .then(line_id => resolve([loancard_line, {_table: 'scrap_lines', id: line_id}]))
                    .catch( reject );
                });
            };
            if (destination.scrap) {
                return returnToScrap();

            } else if (destination.serial) {
                return returnSerial();

            } else {
                return returnToStock();

            };
        };
        function updateIssues([loancard_line, destination_link]) {
            let remaining_qty = options.qty;
            function updateIssue(issue, remaining_qty) {
                function createIssueForRemainder() {
                    return new Promise( ( resolve, reject ) => {
                        loancard_line.createIssue({
                            user_id_issue: issue.user_id_issue,
                            size_id:       issue.size_id,
                            qty:           issue.qty - remaining_qty,
                            order_id:      issue.order_id,
                            status:        4,
                            user_id:       user_id
                        })
                        .then(new_issue => {
                            fn.actions.create([
                                'ISSUES | CREATED FROM PARTIAL RETURN',
                                user_id,
                                [
                                    {_table: 'issues', id: issue.issue_id},
                                    {_table: 'issues', id: new_issue.issue_id}
                                ]
                            ])
                            .then(resolve)
                            .catch( reject );
                        })
                        .catch( reject );
                    });
                };

                return new Promise( ( resolve, reject ) => {
                    let issue_record = {status: 5};
                    let actions = [];
        
                    if (remaining_qty < issue.qty) {
                        issue_record.qty = remaining_qty;
                        actions.push(createIssueForRemainder);
                        
                    };
                    actions.push(fn.update(issue, issue_record))
                    Promise.all(actions)
                    .then(results => resolve({_table: 'issues', id: issue.issue_id}))
                    .catch( reject );
                });
            };

            return new Promise( ( resolve, reject ) => {
                let actions = [];
                loancard_line.issues.forEach(issue => {
                    if (remaining_qty > 0) {
                        actions.push(updateIssue(issue, remaining_qty));
                        remaining_qty -= issue.qty;
                    };
                });
                Promise.all(actions)
                .then(links => {
                    resolve([
                        'ISSUES | RETURNED',
                        user_id,
                        [
                            {_table: 'loancard_lines', id: loancard_line.line_id},
                            destination_link
                        ].concat(links),
                        loancard_line.loancard_id
                    ]);
                })
                .catch( reject );
            });
        };

        return new Promise( ( resolve, reject ) => {
            checkLoancardLine()
            .then(checkReturnDestination)
            .then(returnStock)
            .then(updateIssues)
            .then(fn.actions.create)
            .then(resolve)
            .catch( reject );
        });
    };
};