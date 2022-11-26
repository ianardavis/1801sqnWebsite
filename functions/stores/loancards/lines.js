module.exports = function (m, fn) {
    fn.loancards.lines.get = function (loancard_line_id, includes = []) {
        return new Promise((resolve, reject) => {
            m.loancard_lines.findOne({
                where: {loancard_line_id: loancard_line_id},
                include: [m.loancards].concat(includes)
            })
            .then(line => {
                if (line) {
                    resolve(line);

                } else {
                    reject(new Error('Line not found'));

                };
            })
            .catch(err => reject(err));
        });
    };
    
    function process_lines(lines, user_id) {
        return new Promise((resolve, reject) => {
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
            .then(results => {
                let loancards = [];

                results
                .filter (e => e.status === 'fulfilled' && !loancards.includes(e.value))
                .forEach(e => loancards.push(e.value));

                resolve(loancards);
            })
            .catch(err => reject(err));
        });
    };
    function check_loancard(loancard_id, user_id) {
        return new Promise((resolve, reject) => {
            m.loancards.findOne({
                where: {loancard_id: loancard_id},
                include: [{
                    model:    m.loancard_lines,
                    as:       'lines',
                    where:    {status: {[fn.op.or]: [1, 2]}},
                    required: false
                }]
            })
            .then(loancard => {
                if (!loancard.lines || loancard.lines.length === 0) {
                    if (loancard.status === 0) {
                        resolve(false);

                    } else if (loancard.status === 1) {
                        fn.loancards.cancel({loancard_id: loancard.loancard_id, user_id: user_id, noforce: true})
                        .then(result => resolve(result))
                        .catch(err => {
                            console.log(err);
                            reject(err);
                        });

                    } else if (loancard.status === 2) {
                        fn.loancards.close({loancard_id: loancard.loancard_id, user_id: user_id})
                        .then(result => resolve(result))
                        .catch(err => {
                            console.log(err);
                            reject(err);
                        });

                    } else if (loancard.status === 3) {
                        resolve(false);

                    } else {
                        reject(new Error('Unknown loancard status'));

                    };
                } else {
                    resolve(false);

                };
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    };
    function check_lines(loancard_id, user_id) {
        return new Promise((resolve, reject) => {
            m.loancard_lines.findAll({
                where: {
                    loancard_id: loancard_id,
                    status: 2
                },
                include: [{
                    model: m.issues,
                    where: {status: 4},
                }]
            })
            .then(lines => {
                actions = [];
                lines.forEach(line => {
                    if (!line.issues || line.issues.length === 0) {
                        line.update({status: 3})
                        .then(result => {
                            fn.actions.create(
                                'LOANCARD LINE | CLOSED',
                                user_id,
                                [{table: 'loancard_lines', id: line.loancard_line_id}]
                            )
                            .then(result => resolve(true));
                        })
                        .catch(err => reject(err));

                    } else {
                        resolve(false);

                    };
                });
            })
            .catch(err => reject(err));
        });
    };
    fn.loancards.lines.process = function (lines, user_id) {
        return new Promise((resolve, reject) => {
            process_lines(lines, user_id)
            .then(loancard_ids => {
                let loancard_checks = [];
                loancard_ids.forEach(loancard_id => {
                    loancard_checks.push(new Promise((resolve, reject) => {
                        check_lines(loancard_id, user_id)
                        .then(result => {
                            check_loancard(loancard_id, user_id)
                            .then(result => resolve(true))
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    }));
                });
                Promise.allSettled(loancard_checks)
                .then(results => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function cancel_line_check(line_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.lines.get(
                line_id,
                [m.issues, m.sizes]
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
            .catch(err => reject(err));
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
                            issue.update({status: 2})
                            .then(result => {
                                if (result) {
                                    links.push({table: 'issues', id: issue.issue_id});
                                    resolve(issue);

                                } else {
                                    reject(new Error('Issue not updated'));

                                };
                            })
                            .catch(err => reject(err));

                        } else {
                            reject(new Error('Link not destroyed'));

                        };
                    })
                    .catch(err => reject(err));
                }));
            });
            Promise.all(actions)
            .then(resolved_issues => resolve([resolved_issues, links]))
            .catch(err => reject(err));
        });
    };
    function return_to_location(serial_id, location, issues, size_id) {
        if (serial_id) {
            return fn.serials.return(serial_id, location);

        } else {
            return new Promise((resolve, reject) => {
                const qty = issues.reduce((prev, curr) => prev.qty + curr.qty, 0);
                fn.stocks.get({size_id: size_id, location: location})
                .then(stock => {
                    fn.stocks.return(stock.stock_id, qty)
                    .then(link => resolve([link, qty]))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            });

        };
    };
    fn.loancards.lines.cancel = function (return_line, user_id) {
        return new Promise((resolve, reject) => {
            cancel_line_check(return_line.loancard_line_id)
            .then(line => {
                update_issues_and_destroy_links(line.issues)
                .then(([issues, links]) => {
                    return_to_location(
                        line.serial_id,
                        return_line.location,
                        issues,
                        line.size_id
                    )
                    .then(([link, qty]) => {
                        line.update({status: 0})
                        .then(result => {
                            fn.actions.create(
                                'LOANCARD LINE | CANCELLED',
                                user_id,
                                [
                                    {table: 'loancard_lines', id: line.loancard_line_id},
                                    link
                                ].concat(links)
                            )
                            .then(result => resolve(line.loancard_id));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function check_nsn(size, options = {}) {
        return new Promise((resolve, reject) => {
            if (size.has_nsns) {
                if (options.nsn_id) {
                    fn.nsns.get(options.nsn_id)
                    .then(nsn => {
                        if (nsn.size_id !== size.size_id) {
                            reject(new Error('NSN is not for this size'));

                        } else {
                            resolve(nsn.nsn_id);

                        };
                    })
                    .catch(err => reject(err));

                } else {
                    reject(new Error('No NSN ID submitted'));

                };
            } else {
                resolve(null);

            };
        });
    };
    fn.loancards.lines.create = function(loancard_id, issue, user_id, line) {
        return new Promise((resolve, reject) => {
            Promise.all([
                fn.loancards.get(loancard_id),
                fn.sizes.get(issue.size_id)
            ])
            .then(([loancard, size]) => {
                check_nsn(size, line)
                .then(nsn_id => {
                    let action = null;
                    if (size.has_serials) {
                        action = add_serial;

                    } else {
                        action = add_stock;

                    };
                    action(size.size_id, nsn_id, loancard.loancard_id, user_id, line, issue)
                    .then(result => resolve(result))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
    };
    function add_serial(size_id, nsn_id, loancard_id, user_id, line, issue) {
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
                                // const resolve_obj = [
                                //     loancard_line.loancard_line_id,
                                //     [
                                //         {table: 'loancard_lines', id: loancard_line.loancard_line_id},
                                //         {table: 'serials',        id: serial.serial_id}
                                //     ]
                                // ];
                                Promise.all([
                                    serial.update({
                                        issue_id:    issue.issue_id,
                                        location_id: null
                                    }),
                                    issue.update({
                                        status: 4
                                    })
                                ])
                                .then(([result1, result2]) => {
                                    console.log("Results", result1, result2);
                                    fn.actions.create(
                                        'LOANCARD LINE | CREATED',
                                        user_id,
                                        [
                                            {table: 'loancard_lines', id: loancard_line.loancard_line_id},
                                            {table: 'serials',        id: serial.serial_id},
                                            {table: 'issues',         id: issue.issue_id}
                                        ]
                                    )
                                    .then(action => resolve(true));
                                })
                                .catch(err => {
                                    console.log(err);
                                    reject(err);
                                });
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
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
            .catch(err => reject(err));
        });
    };
    function check_serial(size_id, serial_id) {
        return new Promise((resolve, reject) => {
            if (!serial_id) {
                reject(new Error('No Serial ID submitted'));

            } else {
                fn.serials.get(serial_id)
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
                .catch(err => reject(err));
            };
        });
    };

    function add_stock(size_id, nsn_id, loancard_id, user_id, line, issue) {
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
                            issue.update({status: 4})
                            .then(result => {
                                if (result) {
                                    fn.actions.create(
                                        `LOANCARD LINE | ${(created ? 'CREATED' : `INCREMENTED BY ${line.qty}`)}`,
                                        user_id,
                                        [
                                            {table: 'stocks',         id: stock.stock_id},
                                            {table: 'issues',         id: issue.issue_id},
                                            {table: 'loancard_lines', id: loancard_line.loancard_line_id}
                                        ]
                                    )
                                    .then(action => resolve(true));
                                } else {
                                    reject(new Error('Issue not updated'));

                                };
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function check_stock(size_id, options = {}) {
        return new Promise((resolve, reject) => {
            if (!options.stock_id) {
                reject(new Error('No stock ID submitted'));

            } else {
                fn.stocks.get({stock_id: options.stock_id})
                .then(stock => {
                    if (stock.size_id !== size_id) {
                        reject(new Error('Stock record is not for this size'));

                    } else {
                        resolve(stock);

                    };
                })
                .catch(err => reject(err));
            };
        });
    };

    function return_line_check(line) {
        return new Promise((resolve, reject) => {
            let total_return_qty = 0;
            let getIssues = [];
            //for each issue, if return qty is above 0:
            //      Get the issue,
            //      Ensure it is for the specified loancard line
            //      Ensure return qty does not exceed issue qty
            //      add return qty to returned issue record
            line.issues.forEach(issue => {
                issue.qty = Number(issue.qty);
                if (issue.qty > 0) {
                    getIssues.push(new Promise((resolve, reject) => {
                        fn.issues.get(
                            {issue_id: issue.issue_id},
                            {loancard_lines: true}
                        )
                        .then(_issue => {
                            if (
                                !_issue.loancard_lines ||
                                 _issue.loancard_lines.filter(e => e.loancard_line_id === line.loancard_line_id).length === 0
                            ) {
                                reject(new Error('Issue not for this loancard line'));
    
                            } else if (issue.qty > _issue.qty) {
                                reject(new Error('Return qty is greater than issue qty'));
    
                            } else {
                                total_return_qty += issue.qty;
                                _issue.return_qty = issue.qty;
                                resolve(_issue);

                            };
                        })
                    }));
                };
            });
            if (getIssues.length > 0) {
                Promise.all(getIssues)
                .then(issues => {
                    if (total_return_qty > 0) {
                        fn.loancards.lines.get(
                            line.loancard_line_id,
                            [m.sizes, m.serials]
                        )
                        .then(loancard_line => {
                            if (loancard_line.status === 0) {
                                reject(new Error('This line has already been cancelled'));
            
                            } else if (loancard_line.status === 1) {
                                reject(new Error('This line is still pending'));
            
                            } else if (loancard_line.status === 2) {
                                if (loancard_line.size) {
                                    check_return_destination(line, loancard_line)
                                    .then(destination => resolve(
                                        [loancard_line, issues, destination, total_return_qty]
                                    ))
                                    .catch(err => reject(err));
            
                                } else {
                                    reject(new Error('Size not found'));
            
                                };
                            } else if (loancard_line.status === 3) {
                                reject(new Error('This line has already been returned'));
            
                            } else {
                                reject(new Error('Unknown line status'));
            
                            };
                        })
                        .catch(err => reject(err));
                    } else {
                        reject(new Error('Return qty is 0'));

                    };
                })
                .catch(err => reject(err));

            } else {
                reject(new Error('No issues to return'));

            };
        });
    };
    function check_return_destination(line, loancard_line) {
        return new Promise((resolve, reject) => {
            if (line.scrap && line.scrap === '1') {
                fn.scraps.get({supplier_id: loancard_line.size.supplier_id})
                .then(scrap => resolve({scrap: scrap}))
                .catch(err => reject(err));
                
            } else if (line.location) {
                if (loancard_line.size.has_serials) {
                    if (loancard_line.serial) {
                        fn.locations.get({location: line.location})
                        .then(location => resolve({
                            serial: {
                                serial:      loancard_line.serial,
                                location_id: location.location_id
                            }
                        }))
                        .catch(err => reject(err));

                    } else {
                        reject(new Error('No valid serial # on loancard'));

                    };
            
                } else {
                    fn.stocks.get({size_id: loancard_line.size_id, location: line.location})
                    .then(stock => resolve({stock: stock}))
                    .catch(err => reject(err));

                };

            } else {
                reject(new Error('No return destination specified'));

            };
        });
    };
    function return_stock(line, destination, qty) {
        return new Promise((resolve, reject) => {
            console.log(line);
            if (destination.scrap) {
                fn.scraps.lines.add(
                    destination.scrap.scrap_id,
                    line.size_id,
                    {
                        serial_id: line.serial_id,
                        nsn_id:    line.nsn_id,
                        qty:       qty
                    }
                )
                .then(scrap_line_id => resolve({table: 'scrap_lines', id: scrap_line_id}))
                .catch(err => reject(err));

            } else if (destination.serial) {
                destination.serial.serial.update({
                    issue_id: null,
                    location_id: destination.serial.location_id
                })
                .then(result => resolve({table: 'serials', id: destination.serial.serial.serial_id}))
                .catch(err => reject(err));

            } else {
                destination.stock.increment('qty', {by: qty})
                .then(result => {
                    if (result) {
                        resolve({table: 'stocks', id: destination.stock.stock_id});

                    } else {
                        reject(new Error('Stock not incremented'));

                    };
                })
                .catch(err => reject(err));

            };
        });
    };
    function update_issue(loancard_line, issue, user_id) {
        return new Promise((resolve, reject) => {
            let issue_record = {status: 5};
            let actions = [];

            if (issue.return_qty < issue.qty) {
                const outstanding_qty = issue.qty - issue.return_qty;
                issue_record.qty = issue.return_qty

                actions.push(new Promise((resolve, reject) => {
                    m.issues.create({
                        user_id_issue: issue.user_id_issue,
                        size_id:       issue.size_id,
                        qty:           outstanding_qty,
                        order_id:      issue.order_id,
                        status:        4,
                        user_id:       user_id
                    })
                    .then(new_issue => {
                        loancard_line.addIssue(new_issue)
                        .then(result => resolve(true))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                }));
                
            };
            actions.push(issue.update(issue_record))
            Promise.all(actions)
            .then(results => resolve({table: 'issues', id: issue.issue_id}))
            .catch(err => reject(err));
        });
    };
    function update_issues(issues, line, user_id) {
        return new Promise((resolve, reject) => {
            let actions = [];
            issues.forEach(issue => {
                actions.push(update_issue(line, issue, user_id));
            });
            Promise.all(actions)
            .then(issue_links => resolve(issue_links))
            .catch(err => reject(err));
        });
    };
    // function check_line_complete(loancard_line_id, user_id) {
    //     return new Promise((resolve, reject) => {
    //         fn.loancards.lines.get(loancard_line_id, [m.issues])
    //         .then(line => {
    //             if (line.issues.filter(e => e.status === 4).length > 0) {
    //                 resolve(false);

    //             } else {
    //                 line.update({status: 3})
    //                 .then(result => {
    //                     fn.actions.create(
    //                         'LOANCARD LINE | CLOSED',
    //                         user_id,
    //                         [{table: 'loancard_lines', id: line.loancard_line_id}]
    //                     )
    //                     .then(result => resolve(true));
    //                 })
    //                 .catch(err => reject(err));

    //             };
    //         })
    //         .catch(err => reject(err));
    //     });
    // };
    fn.loancards.lines.return = function (options = {}, user_id) {
        return new Promise((resolve, reject) => {
            return_line_check(options)
            .then(([line, issues, destination, total_return_qty]) => {
                return_stock(line, destination, total_return_qty)
                .then(destination_link => {
                    update_issues(issues, line, user_id)
                    .then(issue_links => {
                        // check_line_complete(line.loancard_line_id, user_id)
                        // .then(line_complete => {
                        fn.actions.create(
                            'ISSUES | RETURNED',
                            user_id,
                            [
                                {table: 'loancard_lines', id: line.loancard_line_id},
                                destination_link
                            ].concat(issue_links)
                        )
                        .then(result => resolve(line.loancard_id));
                        // })
                        // .catch(err => reject(err));
                    })
                    .catch(err => reject(err));

                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};