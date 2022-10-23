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
            lines.filter(e => e.status === '3').forEach(line => {
                actions.push(fn.loancards.lines.return(line, user_id));
            });
            lines.filter(e => e.status === '0').forEach(line => {
                actions.push(fn.loancards.lines.cancel(line, user_id));
            });
            Promise.allSettled(actions)
            .then(results => {
                let loancards = [];
                results.filter(e => e.status === 'fulfilled').forEach(e => {
                    if (!loancards.includes(e.value)) loancards.push(e.value)
                });
                resolve(loancards);
            })
            .catch(err => reject(err));
        });
    };
    function check_loancard(loancard_id) {
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
    fn.loancards.lines.process = function (lines, user_id) {
        return new Promise((resolve, reject) => {
            process_lines(lines, user_id)
            .then(loancard_ids => {
                let loancard_checks = [];
                loancard_ids.forEach(loancard_id => {
                    loancard_checks.push(check_loancard(loancard_id));
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
                    const args = [size.size_id, nsn_id, loancard.loancard_id, user_id, line, issue];
                    if (size.has_serials) {
                        action = add_serial(...args);
                    } else {
                        action = add_stock(...args);
                    };
                    action
                    .then(([loancard_line_id, links]) => {
                        if (nsn_id) links.push({table: 'nsns', id: nsn_id});
                        resolve([loancard_line_id, links]);
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
    };
    function add_serial(size_id, nsn_id, loancard_id, user_id, line, issue) {
        return new Promise((resolve, reject) => {
            let actions = [];
            line.serials.forEach(serial => {
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
                            m.issue_loancard_lines.create({
                                issue_id: issue.issue_id,
                                loancard_line_id: loancard_line.loancard_line_id
                            })
                            .then(link_line => {
                                const resolve_obj = [
                                    loancard_line.loancard_line_id,
                                    [
                                        {table: 'loancard_lines', id: loancard_line.loancard_line_id},
                                        {table: 'serials',        id: serial.serial_id}
                                    ]
                                ];
                                serial.update({
                                    issue_id:    issue.issue_id,
                                    location_id: null
                                })
                                .then(result => {
                                    fn.actions.create(
                                        'LOANCARD LINE | CREATED',
                                        user_id,
                                        [{table: 'loancard_lines', id: loancard_line.loancard_line_id}]
                                    )
                                    .then(action => resolve(resolve_obj));
                                })
                                .catch(err => {
                                    console.log(err);
                                    resolve(resolve_obj)
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
                let resolve_obj = [];
                results.filter(e => e.status === 'fulfilled').forEach(r => resolve_obj.concat(r.value));
                resolve(resolve_obj);
            })
            .catch(err => reject(err));
        });
    };
    function check_serial(size_id, serial_id) {
        return new Promise((resolve, reject) => {
            if (!serial_id) reject(new Error('No Serial ID submitted'))
            else {
                fn.serials.get(serial_id)
                .then(serial => {
                    if      ( serial.size_id !== size_id) reject(new Error('Serial # is not for this size'))
                    else if ( serial.issue_id)            reject(new Error('This serial is already issued'))
                    else if (!serial.location_id)         reject(new Error('This serial is not in stock'))
                    else resolve(serial);
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
                            const resolve_obj = [
                                loancard_line.loancard_line_id,
                                [
                                    {table: 'loancard_lines', id: loancard_line.loancard_line_id},
                                    {table: 'stocks',         id: stock.stock_id}
                                ]
                            ];
                            if (created) {
                                fn.actions.create(
                                    'LOANCARD LINE | CREATED',
                                    user_id,
                                    [{table: 'loancard_lines', id: loancard_line.loancard_line_id}]
                                )
                                .then(action => resolve(resolve_obj));
                            } else {
                                resolve(resolve_obj);
                            };
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

    
    function return_line_check(line_id) {
        return new Promise((resolve, reject) => {
            fn.loancards.lines.get(
                line_id,
                [m.issues, m.sizes]
            )
            .then(line => {
                if (line.status === 0) {
                    reject(new Error('This line has been cancelled'));

                } else if (line.status === 1) {
                    reject(new Error('This line is still pending'));

                } else if (line.status === 2) {
                    if (line.size) {
                        resolve(line);

                    } else {
                        reject(new Error('Size not found'));

                    };
                } else if (line.status === 3) {
                    reject(new Error('This line has already been returned'));

                } else {
                    reject(new Error('Unknown line status'));

                };
            })
            .catch(err => reject(err));
        });
    };
    function update_issue(line, user_id) {
        return new Promise((resolve, reject) => {
            line.qty = Number(line.qty);
            if (line.qty <= 0) {
                reject(new Error('Receive quantity is 0 or less'));
            } else {
                fn.issues.get({issue_id: line.issue_id})
                .then(issue => {
                    if (line.qty > issue.qty) {
                        reject(new Error('Receive quantity is greater than the issue quantity'));

                    } else {
                        issue.update({status: 5})
                        .then(result => {
                            if (result) {
                                if (line.qty < issue.qty) {
                                    issue.update({qty: line.qty})
                                    .then(result => {
                                        if (result) {
                                            m.issues.create({
                                                user_id_issue: issue.user_id_issue,
                                                size_id:       issue.size_id,
                                                qty:           issue.qty - line.qty,
                                                order_id:      issue.order_id,
                                                status:        4,
                                                user_id:       user_id
                                            })
                                            .then(new_issue => resolve({new_issue: new_issue}))
                                            .catch(err => reject(err));
                                        } else {
                                            reject(new Error('Quantity not updated'));
                                        };
                                    })
                                    .catch(err => reject(err));
                                } else {
                                    resolve({});
                                };
                            } else {
                                reject(new Error('Status not updated'));
                            };
                        })
                        .catch(err => reject(err));
                        
                    };
                })
                .catch(err => reject(err));
            };
        });
    };
    fn.loancards.lines.return = function (options = {}, user_id) {
        return new Promise((resolve, reject) => {
            console.log(options);
            return_line_check(options.loancard_line_id)
            .then(line => {
                let actions = [];
                options.issues.forEach(issue => {
                    actions.push(update_issue(issue, user_id));
                });
                
                // return stock or serial to location

                resolve(line.loancard_id);
                // update_issues(line.issues)
                // .then(([issues, links]) => {
                //     return_to_location(
                //         line.serial_id,
                //         options.location,
                //         issues,
                //         line.size_id
                //     )
                //     .then(([link, qty]) => {
                //         let update_actions = [], issue_links = [];
                //         if ((options.qty < line.qty) && options.qty >= 1) {
                //             update_actions.push(new Promise((resolve, reject) => {
                //                 m.loancard_lines.create({
                //                     loancard_id: line.loancard_id,
                //                     size_id:     line.size_id,
                //                     serial_id:   line.serial_id,
                //                     nsn_id:      line.nsn_id,
                //                     qty:         line.qty - options.qty,
                //                     status:      2,
                //                     user_id:     line.user_id
                //                 })
                //                 .then(new_line => {
                //                     line.update({qty: options.qty})
                //                     .then(result => {
                //                         fn.actions.create(
                //                             'LOANCARD LINE | CREATED | From partial return',
                //                             user_id,
                //                             [
                //                                 {table: 'loancard_lines', id: line.loancard_line},
                //                                 {table: 'loancard_lines', id: new_line.loancard_line}
                //                             ]
                //                         )
                //                         .then(result => resolve(true));
                //                     })
                //                     .catch(err => reject(err));
                //                 })
                //                 .catch(err => reject(err));
                //             }));
                //         };
                //         result.issue_ids.forEach(issue_id => {
                //             update_actions.push(new Promise((resolve, reject) => {
                //                 fn.issues.get({issue_id: issue_id})
                //                 .then(issue => {
                //                     if (issue.status === 0) {
                //                         reject(new Error('Issue is already cancelled'));

                //                     } else if (issue.status === 1) {
                //                         reject(new Error('Issue is pending approval'));

                //                     } else if (issue.status === 2) {
                //                         reject(new Error('Issue is not issued'));

                //                     } else if (issue.status === 3) {
                //                         reject(new Error('Issue is ordered but not issued'));

                //                     } else if (issue.status === 4) {
                //                         issue.update({status: 5})
                //                         .then(result => {
                //                             issue_links.push({table: 'issues', id: issue.issue_id})
                //                             resolve(true);
                //                         })
                //                         .catch(err => reject(err));

                //                     } else {
                //                         reject(new Error('Unknown issue status'));
                //                     };
                //                 })
                //             }));
                //         })
                //         update_actions.push(line.update({status: 3}));
                //         Promise.allSettled(update_actions)
                //         .then(results => {
                //             if (results.filter(e => e.status === 'rejected').length > 0) console.log(results);
                //             fn.actions.create(
                //                 'LOANCARD LINE | RETURNED',
                //                 user_id,
                //                 [
                //                     {table: 'loancard_lines', id: line.loancard_line_id},
                //                     {table: 'locations',      id: location.location_id}
                //                 ].concat(issue_links).concat(result.links)
                //             )
                //             .then(result => resolve(line.loancard_id));
                //         })
                //         .catch(err => resolve(line.loancard_id));
                //     })
                //     .catch(err => reject(err));
                // })
                // .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};