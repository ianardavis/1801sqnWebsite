module.exports = function (m, fn) {
    fn.loancards.lines.get = function (where, include = []) {
        return fn.get(
            m.loancard_lines,
            where,
            include
        );
    };
    fn.loancards.lines.get_all = function (where, options) {
        return new Promise((resolve, reject) => {
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
            .catch(reject);
        });
    };
    
    fn.loancards.lines.process = function (lines, user_id) {
        function action_lines() {
            return new Promise((resolve, reject) => {
                let actions = [];
    
                lines
                .filter (e => e.status === '3')
                .forEach(line => {
                    console.log(`line (40): ${line}`)
                    actions.push(fn.loancards.lines.return(line, user_id));
                });
    
                lines
                .filter (e => e.status === '0')
                .forEach(line => {
                    actions.push(fn.loancards.lines.cancel(line, user_id));
                });
    
                Promise.allSettled(actions)
                .then(fn.check_results)
                .then(resolve)
                .catch(reject);
            });
        };
        function check_loancards(loancard_ids) {
            function check_loancard_lines(loancard_id) {
                function get_lines() {
                    return m.loancard_lines.findAll({
                        where: {
                            loancard_id: loancard_id,
                            status: 2
                        },
                        include: [{
                            model: m.issues,
                            where: {status: 4},
                        }]
                    });
                };
                function check_lines(lines) {
                    return new Promise((resolve, reject) => {
                        let actions = [];
                        lines.forEach(line => {
                            if (!line.issues || line.issues.length === 0) {
                                actions.push(
                                    new Promise((resolve, reject) => {
                                        fn.update(line, {status: 3})
                                        .then(result => {
                                            fn.actions.create([
                                                'LOANCARD LINE | CLOSED',
                                                user_id,
                                                [{_table: 'loancard_lines', id: line.loancard_line_id}]
                                            ])
                                            .then(resolve);
                                        })
                                        .catch(reject);
                                    })
                                );
                            };
                        });
                        Promise.all(actions)
                        .then(results => resolve(loancard_id))
                        .catch(reject);
                    });
                };

                return new Promise((resolve, reject) => {
                    get_lines()
                    .then(check_lines)
                    .then(resolve)
                    .catch(reject);
                });
            };
            function check_loancard(loancard_id) {
                function get_loancard() {
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

                return new Promise((resolve, reject) => {
                    get_loancard()
                    .then(loancard => {
                        if (!loancard.lines || loancard.lines.length === 0) {
                            if (loancard.status === 0) {
                                resolve(true);
        
                            } else if (loancard.status === 1) {
                                fn.loancards.cancel({loancard_id: loancard.loancard_id, user_id: user_id, noforce: true})
                                .then(resolve)
                                .catch(reject);
        
                            } else if (loancard.status === 2) {
                                fn.loancards.close({loancard_id: loancard.loancard_id, user_id: user_id})
                                .then(resolve)
                                .catch(reject);
        
                            } else if (loancard.status === 3) {
                                resolve(true);
        
                            } else {
                                reject(new Error('Unknown loancard status'));
        
                            };
                        } else {
                            resolve(true);
        
                        };
                    })
                    .catch(reject);
                });
            };

            return new Promise((resolve, reject) => {
                let actions = [];
                loancard_ids.forEach(loancard_id => {
                    actions.push(new Promise((resolve, reject) => {
                        check_loancard_lines(loancard_id)
                        .then(check_loancard)
                        .then(resolve)
                        .catch(reject);
                    }));
                });
                Promise.allSettled(actions)
                .then(fn.check_results)
                .then(results => resolve(true))
                .catch(reject);
            });
        };

        return new Promise((resolve, reject) => {
            action_lines()
            .then(check_loancards)
            .then(resolve)
            .catch(err => {console.log(`Error (171): ${err}`);reject(err)});
        });
    };

    fn.loancards.lines.cancel = function (return_line, user_id) {
        function check(line_id) {
            return new Promise((resolve, reject) => {
                fn.loancards.lines.get(
                    {loancard_line_id: line_id},
                    [m.issues, m.sizes, m.loancards]
                )
                .then(line => {
                    if (line.status === 0) {
                        reject(new Error('This line has already been cancelled'));
    
                    } else if (line.status === 1) {
                        if (line.size) {
                            resolve(line);
    
                        } else {
                            reject(new Error('Size not found'));
    
                        };
                        
                    } else if (line.status === 2) {
                        reject(new Error('This line has already been completed'));
    
                    } else if (line.status === 3) {
                        reject(new Error('This line has already been returned'));
    
                    } else {
                        reject(new Error('Unknown line status'));
    
                    };
                })
                .catch(reject);
            });
        };
        function update_issues_and_destroy_links(issues) {
            return new Promise((resolve, reject) => {
                let actions = [];
                let links = [];
                issues.forEach(issue => {
                    actions.push(new Promise((resolve, reject) => {
                        issue.issue_loancard_line.destroy()
                        .then(result => {
                            if (result) {
                                fn.update(issue, {status: 2})
                                .then(result => {
                                    links.push({_table: 'issues', id: issue.issue_id});
                                    resolve(issue);
                                })
                                .catch(reject);
    
                            } else {
                                reject(new Error('Link not destroyed'));
    
                            };
                        })
                        .catch(reject);
                    }));
                });
                Promise.all(actions)
                .then(resolved_issues => resolve([resolved_issues, links]))
                .catch(reject);
            });
        };
        function return_to_location(serial_id, location, issues, size_id) {
            if (serial_id) {
                return fn.serials.return(serial_id, location);
    
            } else {
                return new Promise((resolve, reject) => {
                    const qty = issues.reduce((prev, curr) => prev.qty + curr.qty, 0);
                    fn.stocks.find({size_id: size_id, location: location})
                    .then(stock => {
                        fn.stocks.return(stock.stock_id, qty)
                        .then(link => resolve(link))
                        .catch(reject);
                    })
                    .catch(reject);
                });
    
            };
        };
        return new Promise((resolve, reject) => {
            check(return_line.loancard_line_id)
            .then(line => {
                update_issues_and_destroy_links(line.issues)
                .then(([issues, links]) => {
                    return_to_location(
                        line.serial_id,
                        return_line.location,
                        issues,
                        line.size_id
                    )
                    .then(link => {
                        fn.update(line, {status: 0})
                        .then(result => {
                            fn.actions.create([
                                'LOANCARD LINE | CANCELLED',
                                user_id,
                                [
                                    {_table: 'loancard_lines', id: line.loancard_line_id},
                                    link
                                ].concat(links)
                            ])
                            .then(result => resolve(line.loancard_id));
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.loancards.lines.create = function(loancard_id, issue, user_id, line) {
        function check_nsn(size) {
            return new Promise((resolve, reject) => {
                if (size.has_nsns) {
                    if (line.nsn_id) {
                        fn.nsns.get({nsn_id: line.nsn_id})
                        .then(nsn => {
                            if (nsn.size_id !== size.size_id) {
                                reject(new Error('NSN is not for this size'));
    
                            } else {
                                resolve(nsn.nsn_id);
    
                            };
                        })
                        .catch(reject);
    
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
                return new Promise((resolve, reject) => {
                    if (!serial_id) {
                        reject(new Error('No Serial ID submitted'));
        
                    } else {
                        fn.serials.get({serial_id: serial_id})
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
                        .catch(reject);
                    };
                });
            };
            return new Promise((resolve, reject) => {
                console.log(size_id, nsn_id, loancard_id, user_id, line);
                let actions = [];
                line.serials.forEach(serial => {
                    console.log(serial);
                    actions.push(new Promise((resolve, reject) => {
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
                                console.log("loancard line id", loancard_line.loancard_line_id);
                                m.issue_loancard_lines.create({
                                    issue_id: issue.issue_id,
                                    loancard_line_id: loancard_line.loancard_line_id
                                })
                                .then(link_line => {
                                    console.log("link id", link_line.issue_loancard_line_id);
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
                                        console.log("Results", result1, result2);
                                        fn.actions.create([
                                            'LOANCARD LINE | CREATED',
                                            user_id,
                                            [
                                                {_table: 'loancard_lines', id: loancard_line.loancard_line_id},
                                                {_table: 'serials',        id: serial.serial_id},
                                                {_table: 'issues',         id: issue.issue_id}
                                            ]
                                        ])
                                        .then(action => resolve(true));
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        reject(err);
                                    });
                                })
                                .catch(reject);
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    }));
                });
                Promise.allSettled(actions)
                .then(results => {
                    console.log(results);
                    resolve(true);
                    // let resolve_obj = [];
                    // results.filter(e => e.status === 'fulfilled').forEach(r => resolve_obj.concat(r.value));
                    // resolve(resolve_obj);
                })
                .catch(reject);
            });
        };
        function add_stock(size_id, nsn_id, loancard_id) {
            function check_stock(size_id, options = {}) {
                return new Promise((resolve, reject) => {
                    if (!options.stock_id) {
                        reject(new Error('No stock ID submitted'));
        
                    } else {
                        fn.stocks.get_by_ID(options.stock_id)
                        .then(stock => {
                            if (stock.size_id !== size_id) {
                                reject(new Error('Stock record is not for this size'));
        
                            } else {
                                resolve(stock);
        
                            };
                        })
                        .catch(reject);
                    };
                });
            };
            return new Promise((resolve, reject) => {
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
                                loancard_line_id: loancard_line.loancard_line_id
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
                                            {_table: 'loancard_lines', id: loancard_line.loancard_line_id}
                                        ]
                                    ])
                                    .then(action => resolve(true));
                                })
                                .catch(reject);
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
        };
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.loancards.get({loancard_id: loancard_id}),
                fn.sizes    .get({size_id:     issue.size_id})
            ])
            .then(([loancard, size]) => {
                check_nsn(size)
                .then(nsn_id => {
                    const action = (size.has_serials ? add_serial : add_stock);
                    action(size.size_id, nsn_id, loancard.loancard_id)
                    .then(resolve)
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        })
    };

    fn.loancards.lines.return = function (options, user_id) {
        function check_loancard_line() {
            return new Promise((resolve, reject) => {
                fn.loancards.lines.get(
                    {loancard_line_id: options.loancard_line_id},
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
                .then(loancard_line => {
                    if (!loancard_line.issues || loancard_line.issues.length === 0) {
                        reject(new Error('No open issues for this loancard line'));

                    } else {
                        let qty = 0;
                        loancard_line.issues.forEach(i => {qty += Number(i.qty)});
                        if (qty === 0) {
                            reject(new Error('Open quantity is 0'));

                        } else if (loancard_line.status === 0) {
                            reject(new Error('This line has already been cancelled'));
        
                        } else if (loancard_line.status === 1) {
                            reject(new Error('This line is still pending'));
        
                        } else if (loancard_line.status === 2) {
                            if (options.qty > qty) {
                                reject(new Error('Return quantity is greater than open quantity'));
        
                            } else if (loancard_line.size) {
                                resolve(loancard_line);
        
                            } else {
                                reject(new Error('Size not found'));
        
                            };
                        } else if (loancard_line.status === 3) {
                            reject(new Error('This line has already been returned'));
        
                        } else {
                            reject(new Error('Unknown line status'));
        
                        };
                    };
                })
                .catch(reject);
            });
        };
        function check_return_destination(loancard_line) {
            return new Promise((resolve, reject) => {
                console.log(options);
                if (options.scrap && options.scrap === '1') {
                    console.log('scrap');
                    fn.scraps.get_or_create(loancard_line.size.supplier_id)
                    .then(scrap => {console.log('scrap resolved');resolve([loancard_line, {scrap: scrap}])})
                    .catch(reject);
                    
                } else if (options.location) {
                    if (loancard_line.size.has_serials) {
                        console.log('serial');
                        if (loancard_line.serial) {
                            fn.locations.find_or_create({location: options.location})
                            .then(location => {console.log('serial resolved');resolve([
                                loancard_line, 
                                {
                                    serial: {
                                        serial:      loancard_line.serial,
                                        location_id: location.location_id
                                    }
                                }
                            ])})
                            .catch(reject);
    
                        } else {
                            reject(new Error('No valid serial # on loancard'));
    
                        };
                
                    } else {
                        console.log('stock');
                        fn.stocks.find({size_id: loancard_line.size_id, location: options.location})
                        .then(stock => {console.log('Stock resolved');resolve([loancard_line, {stock: stock}])})
                        .catch(reject);
    
                    };
    
                } else {
                    console.log('588');
                    reject(new Error('No return destination specified'));
    
                };
            });
        };
        function return_stock([loancard_line, destination]) {
            console.log(destination);
            return new Promise((resolve, reject) => {
                if (destination.scrap) {
                    fn.scraps.lines.create(
                        destination.scrap.scrap_id,
                        loancard_line.size_id,
                        {
                            serial_id: loancard_line.serial_id,
                            nsn_id:    loancard_line.nsn_id,
                            qty:       options.qty
                        }
                    )
                    .then(scrap_line_id => resolve([loancard_line, {_table: 'scrap_lines', id: scrap_line_id}]))
                    .catch(reject);
    
                } else if (destination.serial) {
                    fn.update(
                        destination.serial.serial,
                        {
                            issue_id: null,
                            location_id: destination.serial.location_id
                        }
                    )
                    .then(result => resolve([loancard_line, {_table: 'serials', id: destination.serial.serial.serial_id}]))
                    .catch(reject);
    
                } else {
                    destination.stock.increment('qty', {by: options.qty})
                    .then(result => {
                        if (result) {
                            resolve([loancard_line, {_table: 'stocks', id: destination.stock.stock_id}]);
    
                        } else {
                            reject(new Error('Stock not incremented'));
    
                        };
                    })
                    .catch(reject);
    
                };
            });
        };
        function update_issues([loancard_line, destination_link]) {
            console.log('(637) Stock returned');
            let remaining_qty = options.qty;
            function update_issue(issue, remaining_qty) {
                function create_issue_for_remainder() {
                    return new Promise((resolve, reject) => {
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
                            .catch(reject);
                        })
                        .catch(reject);
                    });
                };

                return new Promise((resolve, reject) => {
                    let issue_record = {status: 5};
                    let actions = [];
        
                    if (remaining_qty < issue.qty) {
                        issue_record.qty = remaining_qty;
                        actions.push(create_issue_for_remainder);
                        
                    };
                    actions.push(fn.update(issue, issue_record))
                    Promise.all(actions)
                    .then(results => resolve({_table: 'issues', id: issue.issue_id}))
                    .catch(reject);
                });
            };

            return new Promise((resolve, reject) => {
                let actions = [];
                loancard_line.issues.forEach(issue => {
                    if (remaining_qty > 0) {
                        actions.push(update_issue(issue, remaining_qty));
                        remaining_qty -= issue.qty;
                    };
                });
                Promise.all(actions)
                .then(links => {
                    resolve([
                        'ISSUES | RETURNED',
                        user_id,
                        [
                            {_table: 'loancard_lines', id: loancard_line.loancard_line_id},
                            destination_link
                        ].concat(links),
                        loancard_line.loancard_id
                    ]);
                })
                .catch(reject);
            });
        };

        return new Promise((resolve, reject) => {
            check_loancard_line()
            .then(check_return_destination)
            .then(return_stock)
            .then(update_issues)
            .then(fn.actions.create)
            .then(resolve)
            .catch(err => {console.log(err);reject(err)});
        });
    };
};