const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    let loancards = {};
    require('./functions/loancards')(m, inc, loancards);
    app.get('/stores/issues',            pm, al('access_issues', {allow: true}),             (req, res) => res.render('stores/issues/index'));
    app.get('/stores/issues/:id',        pm, al('access_issues', {allow: true}),             (req, res) => {
        m.stores.issues.findOne({
            where: {issue_id: req.params.id},
            attributes: ['issue_id', 'user_id_issue']
        })
        .then(issue => {
            if      (!issue) res.redirect('/stores/issues')
            else if (
                !req.allowed &&
                req.user.user_id !== issue.user_id_issue
                )            res.redirect('/stores/issues')
            else             res.render('stores/issues/show');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/stores/issues');
        })
        res.render('stores/issues/show');
    });
    
    app.get('/stores/count/issues',      pm, al('access_issues', {allow: true, send: true}), (req, res) => {
        if (!allowed) req.query.user_id_issue = req.user.user_id;
        m.stores.issues.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: 'Error counting lines'})
        });
    });
    app.get('/stores/get/issues',        pm, al('access_issues', {allow: true, send: true}), (req, res) => {
        if (!req.allowed) req.query.user_id_issue = req.user.user_id;
        m.stores.issues.findAll({
            where: req.query,
            include: [
                inc.sizes(),
                inc.users({as: 'user_issue'}),
                inc.users({as: 'user'})
            ]
        })
        .then(issues => res.send({success: true, result: issues}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: 'Error getting lines'});
        });
    });
    app.get('/stores/get/issue',         pm, al('access_issues', {allow: true, send: true}), (req, res) => {
        m.stores.issues.findOne({
            where: req.query,
            include: [
                inc.sizes(),
                inc.users({as: 'user_issue'}),
                inc.users({as: 'user'})
            ]
        })
        .then(issue => {
            if (!issue) res.send({success: false, message: 'Issue not found'})
            else if (
                !req.allowed &&
                issue.user_id_issue !== req.user.user_id
            )           res.send({success: false, message: 'Permission denied'})
            else        res.send({success: true,  result: issue});
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: 'Error getting line'});
        });
    });
    app.get('/stores/get/issue_actions', pm, al('access_issues', {allow: true, send: true}), (req, res) => {
        m.stores.issues.findOne({
            where: req.query,
            include: [inc.issue_actions({include: [inc.users()]})],
            attributes: ['issue_id', 'user_id_issue']
        })
        .then(issue => {
            if (!issue) res.send({success: false, message: 'Issue not found'})
            else if (
                !req.allowed &&
                issue.user_id_issue !== req.user.user_id
            )           res.send({success: false, message: 'Permission denied'})
            else        res.send({success: true, result: issue.actions});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/issue_action',  pm, al('access_issues', {allow: true, send: true}), (req, res) => {
        m.stores.issue_actions.findOne({
            where: req.query,
            include: [
                inc.stocks(        {as: 'stock'}),
                inc.nsns(          {as: 'nsn'}),
                inc.serials(       {as: 'serial'}),
                inc.orders(        {as: 'order'}),
                inc.loancard_lines({as: 'loancard_line'}),
                inc.users()
            ]
        })
        .then(action => {
            if (!action) res.send({success: false, message: 'Action not found'})
            else         res.send({success: true,  result: action});
        })
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/issues',           pm, al('issue_add',     {allow: true, send: true}), (req, res) => {
        if (Number(req.body.line.user_id_issue) === 1) res.send({success: false, message: 'Issues can not be made to this user'})
        else {
            let _status = 1;
            if (req.allowed) _status = 2
            create_line(
                {
                    ...req.body.line,
                    ...{
                        _status: _status,
                        user_id: req.user.user_id
                    }
                },
                req.user.user_id
            )
            .then(result => res.send(result))
            .catch(err => {
                console.log(err);
                res.send({success: false, message: 'Error creating line'});
            });
        };
    });
    
    app.put('/stores/issues',            pm, al('issue_edit',    {allow: true, send: true}), (req, res) => {
        let actions = [];
        req.body.lines.filter(e => e._status === '0').forEach(line => actions.push(decline_line(line, req.user.user_id)));
        req.body.lines.filter(e => e._status === '2').forEach(line => actions.push(approve_line(line, req.user.user_id)));
        req.body.lines.filter(e => e._status === '3').forEach(line => actions.push(order_line(  line, req.user.user_id)));
        req.body.lines.filter(e => e._status === '4').forEach(line => actions.push(issue_line(  line, req.user.user_id)));
        req.body.lines.filter(e => e._status === '5').forEach(line => actions.push(return_line( line, req.user.user_id)));
        Promise.allSettled(actions)
        .then(results => {
            if (
                results.filter(e => e.status === 'rejected')  .length > 0 ||
                results.filter(e => e.value.success === false).length > 0
            ) {
                console.log(results);
                res.send({success: true, message: 'Some lines failed'});
            } else res.send({success: true, message: 'Lines actioned'});
        })
        .catch(err => res.send({success: false, message: 'Some lines failed'}));
    });
    
    app.delete('/stores/issues/:id',     pm, al('issue_delete',  {allow: true, send: true}), (req, res) => {
        m.stores.issues.findOne({
            where:      {issue_id: req.params.id},
            attributes: ['issue_id', '_status', 'user_id_issue']
        })
        .then(issue => {
            if      (!issue)                                                            res.send({success: false, message: 'Issue not found'})
            else if (!req.allowed && issue.user_id_issue !== req.user.user_id)          res.send({success: false, message: 'Permission denied'})
            else if (issue._status !== 1 && issue._status !== 2 && issue._status !== 3) res.send({success: false, message: 'Only requested, approved and ordered lines can be cancelled'})
            else {
                return issue.update({_status: 0})
                .then(result => {
                    if (!result) res.send({success: false, message: 'Issue not cancelled'})
                    else {
                        return m.stores.issue_actions.create({
                            issue_id: issue.issue_id,
                            _action: 'Cancelled',
                            user_id: req.user.user_id
                        })
                        .then(action => res.send({success: true, message: 'Issue cancelled'}))
                        .catch(err => {
                            console.log(err);
                            res.send({success: true, message: 'Line cancelled. Error creating action'});
                        });
                    };
                })
                .catch(err => {
                    console.log(err);
                    res.send({success: false, message: 'Error updating line'});
                });
            };
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: 'Error getting line'})
        });
    });

    function allowed(user_id, _permission) {
        return new Promise((resolve, reject) => {
            return m.stores.permissions.findOne({
                where: {
                    _permission: _permission,
                    user_id:     user_id
                },
                attributes: ['_permission']
            })
            .then(permission => {
                if (!permission) reject(new Error(`Permission denied: ${_permission}`))
                else             resolve(true);
            })
            .catch(err => reject(err));
        });
    };
    function create_line(line, user_id) {
        console.log(line);
        return new Promise((resolve, reject) => {
            return m.users.users.findOne(
                {where: {user_id: line.user_id_issue}},
                {attributes: ['user_id']}
            )
            .then(user => {
                if (!user) resolve({success: false, message: 'User not found'})
                else {
                    return m.stores.sizes.findOne({
                        where: {size_id: line.size_id},
                        attributes: ['size_id', '_issueable', '_serials']
                    })
                    .then(size => {
                        if      (!size)            resolve({success: false, message: 'Size not found'})
                        else if (!size._issueable) resolve({success: false, message: 'This size can not issued'})
                        else {
                            return m.stores.issues.findOrCreate({
                                where: {
                                    user_id_issue: user.user_id,
                                    size_id:       size.size_id,
                                    _status:       line._status
                                },
                                defaults: {
                                    user_id: user_id,
                                    _qty:    line._qty
                                }
                            })
                            .then(([issue, created]) => {
                                if (created) resolve({success: true, message: 'Issue created'})
                                else {
                                    return issue.increment('_qty', {by: line._qty})
                                    .then(result => {
                                        return m.stores.issue_actions.create({
                                            issue_id: issue.issue_id,
                                            _action:  `Incremented by ${line._qty}`,
                                            user_id:  user_id
                                        })
                                        .then(action => resolve({success: true, message: 'Existing issue incremented'}))
                                        .catch(err => {
                                            console.log(error);
                                            resolve({success: true, message: `Existing issue incremented, error creating action: ${error.message}`})
                                        });
                                    })
                                    .catch(err => reject(err));
                                };
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
    function decline_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(user_id, 'issue_approve')
            .then(result => {
                return m.stores.issues.findOne({
                    where:      {issue_id: line.issue_id},
                    attributes: ['issue_id', '_status']
                })
                .then(issue => {
                    if      (!issue)              resolve({success: false, message: 'Issue not found'})
                    else if (issue._status !== 1) resolve({success: false, message: 'This issue is not pending approval'})
                    else {
                        return issue.update({_status: 0})
                        .then(result => {
                            if (!result) resolve({success: false, message: 'Issue not updated'})
                            else {
                                return m.stores.issue_actions.create({
                                    issue_id: issue.issue_id,
                                    _action: 'Declined',
                                    user_id: user_id
                                })
                                .then(action => resolve({success: true, message: 'Line declined'}))
                                .catch(err => {
                                    console.log(err);
                                    resolve({success: true, message: `Line declined. Error creating action: ${err.message}`});
                                });
                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function approve_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(user_id, 'issue_approve')
            .then(result => {
                return m.stores.issues.findOne({
                    where:      {issue_id: line.issue_id},
                    attributes: ['issue_id', '_status']
                })
                .then(issue => {
                    if      (!issue)              resolve({success: false, message: 'Issue not found'})
                    else if (issue._status !== 1) resolve({success: false, message: 'This issue is not pending approval'})
                    else {
                        return issue.update({_status: 2})
                        .then(result => {
                            if (!result) resolve({success: false, message: 'Issue not updated'})
                            else {
                                return m.stores.issue_actions.create({
                                    issue_id: issue.issue_id,
                                    _action: 'Approved',
                                    user_id: user_id
                                })
                                .then(action => resolve({success: true, message: 'Line approved'}))
                                .catch(err => {
                                    console.log(err);
                                    resolve({success: true, message: `Line approved. Error creating action: ${err.message}`});
                                });
                            };
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function order_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(user_id, 'order_add')
            .then(result => {
                return m.stores.issues.findOne({
                    where:      {issue_id: line.issue_id},
                    attributes: ['issue_id', 'user_id_issue', 'size_id', '_qty', '_status'],
                    include:    [inc.sizes({attributes: ['size_id', '_orderable']})]
                })
                .then(issue => {
                    if      (issue._status !== 2)    resolve({success: false, message: 'Only approved orders can be ordered'})
                    else if (!issue.size)            resolve({success: false, message: 'Size not found'})
                    else if (!issue.size._orderable) resolve({success: false, message: 'This size can not be ordered'})
                    else {
                        return m.stores.orders.findOrCreate({
                            where: {
                                user_id_order: issue.user_id_issue,
                                size_id:       issue.size_id,
                                _status:       1
                            },
                            defaults: {
                                user_id: user_id,
                                _qty:    issue._qty
                            }
                        })
                        .then(([order, created]) => {
                            if (created) {
                                return issue.update({_status: 3})
                                .then(result => {
                                    if (!result) resolve({success: false, message: 'Issue not updated'})
                                    else {
                                        return m.stores.order_actions.create({
                                            order_id: order.order_id,
                                            _action:  'Created from issue',
                                            issue_id: issue.issue_id,
                                            user_id:  user_id
                                        })
                                        .then(action => {
                                            return m.stores.issue_actions.create({
                                                issue_id: issue.issue_id,
                                                _action:  'Ordered',
                                                order_id: order.order_id,
                                                user_id:  user_id
                                            })
                                            .then(action => resolve({success: true, message: 'Order created'}))
                                            .catch(err => {
                                                console.log(err);
                                                resolve({success: true, message: `Order created. Error creating issue action: ${err.message}`});
                                            });
                                        })
                                        .catch(err => {
                                            console.log(err);
                                            resolve({success: true, message: `Order created. Error creating order action: ${err.message}`});
                                        });
                                    };
                                })
                                .catch(err => {
                                    console.log(err);
                                    resolve({success: true, message: `Order created. Error updating issue: ${err.message}`});
                                });
                            } else {
                                return order.increment('_qty', {by: issue._qty})
                                .then(result => {
                                    return issue.update({_status: 3})
                                    .then(result => {
                                        if (!result) resolve({success: false, message: 'Issue not updated'})
                                        else {
                                            return m.stores.order_actions.create({
                                                order_id: order.order_id,
                                                _action:  'Created from issue',
                                                issue_id: issue.issue_id,
                                                user_id:  user_id
                                            })
                                            .then(action => {
                                                return m.stores.issue_actions.create({
                                                    issue_id: issue.issue_id,
                                                    _action:  'Ordered',
                                                    order_id: order.order_id,
                                                    user_id:  user_id
                                                })
                                                .then(action => resolve({success: true, message: 'Order incremented'}))
                                                .catch(err => {
                                                    console.log(err);
                                                    resolve({success: true, message: `Order incremented. Error creating issue action: ${err.message}`});
                                                });
                                            })
                                            .catch(err => {
                                                console.log(err);
                                                resolve({success: true, message: `Order incremented. Error creating order action: ${err.message}`});
                                            });
                                        };
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        resolve({success: true, message: `Order incremented. Error updating issue: ${err.message}`});
                                    });
                                })
                                .catch(err => reject(err));
                            };
                            
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function issue_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(user_id, 'loancard_line_add')
            .then(result => {
                return m.stores.issues.findOne({
                    where:      {issue_id: line.issue_id},
                    attributes: ['issue_id', 'size_id', 'user_id_issue', '_status'],
                    include:    [
                        inc.sizes({
                            attributes: ['size_id', '_issueable', '_nsns', '_serials'],
                            include:    [
                                inc.serials({
                                    where:      {serial_id: line.serial_id || ''},
                                    attributes: ['serial_id', 'issue_id']
                                }),
                                inc.stocks({
                                    where:      {stock_id: line.stock_id || ''},
                                    attributes: ['stock_id']
                                }),
                                inc.nsns({
                                    where:      {nsn_id: line.nsn_id || ''},
                                    attributes: ['nsn_id']
                                })
                            ]
                        })
                    ]
                })
                .then(issue => {
                    if      (issue._status !== 2  && issue._status !== 3)            resolve({success: false, message: 'Only approved or ordered lines can be issued'})
                    else if (!issue.size)                                            resolve({success: false, message: 'Size not found'})
                    else if (!issue.size._issueable)                                 resolve({success: false, message: 'This size is not issueable'})
                    else if (issue.size._nsns     && !line.nsn_id)                   resolve({success: false, message: 'No NSN specified'})
                    else if (issue.size._nsns     && !issue.size.nsns[0])            resolve({success: false, message: 'NSN not found'})
                    else if (issue.size._serials  && !line.serial_id)                resolve({success: false, message: 'No serial # specified'})
                    else if (issue.size._serials  && !issue.size.serials[0])         resolve({success: false, message: 'Serial not found'})
                    else if (issue.size._serials  && issue.size.serials[0].issue_id) resolve({success: false, message: 'Serial # is already issued'})
                    else if (!issue.size._serials && !line.stock_id)                 resolve({success: false, message: 'No stock location specified'})
                    else if (!issue.size._serials && !issue.size.stocks[0])          resolve({success: false, message: 'Stock location not found'})
                    else {
                        loancards.create({
                            user_id_loancard: issue.user_id_issue,
                            user_id:          user_id
                        })
                        .then(loancard => {
                            let loancard_details = {
                                loancard_id: loancard.loancard_id,
                                issue_id:    issue.issue_id,
                                size_id:     issue.size_id,
                                _qty:        line._qty || 1,
                                user_id:     user_id
                            };
                            if (issue.size.serials[0]) loancard_details.serial_id = issue.size.serials[0].serial_id;
                            if (issue.size.nsns[0])    loancard_details.nsn_id    = issue.size.nsns[0].nsn_id;
                            loancards.createLine(loancard_details)
                            .then(loancard_line => {
                                if (loancard_line.success) {
                                    let actions = [],
                                        action_details = {
                                            issue_id:         issue.issue_id,
                                            _action:          'Added to loancard',
                                            loancard_line_id: loancard_line.line_id,
                                            user_id:          user_id
                                        };
                                    if (issue.size.serials[0]) action_details.serial_id = issue.size.serials[0].serial_id;
                                    if (issue.size.nsns[0])    action_details.nsn_id    = issue.size.nsns[0].nsn_id;
                                    if (issue.size.stocks[0])  action_details.stock_id  = issue.size.stocks[0].stock_id;
                                    actions.push(issue.update({_status: 4}));
                                    actions.push(m.stores.issue_actions.create(action_details));
                                    return Promise.all(actions)
                                    .then(result => resolve({success: true, message: 'Line added to loancard'}))
                                    .catch(err => {});
                                } else resolve(loancard_line);
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function return_line(line, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(user_id, 'issue_return')
            .then(result => {

                let location_check = null;
                if (req.body.line.location_id) {
                    location_check = new Promise((resolve, reject) => {
                        return m.stores.locations.findOne({
                            where: {location_id: req.body.line.location_id},
                            attributes: ['location_id']
                        })
                        .then(location => {
                            if (!location) reject(new Error('Location not found'))
                            else           resolve(location);
                        })
                        .reject(err => reject(err));
                    });
                } else if (req.body.line._location) {
                    location_check = new Promise((resolve, reject) => {
                        return m.stores.locations.findOrCreate({where: {_location: req.body.line._location}})
                        .then(([location, created]) => resolve({location_id: location.location_id}))
                        .catch(err => reject(err));
                    });
                } else resolve({success: false, message: 'No return location specified'});

                return location_check()
                .then(location => {
                    return m.stores.issues.findOne({
                        where:      {issue_id: line.issue_id},
                        attributes: ['issue_id', '_status', 'size_id', '_qty'],
                        include:    [
                            inc.sizes({
                                attributes: ['size_id', '_serials']
                            }),
                            inc.loancard_lines({
                                as:         'loancard_line',
                                attributes: ['line_id', '_status', 'nsn_id'],
                                include: [
                                    inc.serials({attributes: ['serial_id', 'location_id', 'issue_id']})
                                ]
                            })
                        ]
                    })
                    .then(issue => {
                        console.log(issue);
                        console.log(issue.size);
                        console.log(issue.loancard_line);
                        if      (!issue)              resolve({success: false, message: 'Issue not found'})
                        else if (issue._status !== 4) resolve({success: false, message: 'Only issued lines can be returned'})
                        else if (!issue.size)         resolve({success: false, message: 'Size not found'})
                        else {
                            let return_action = null;
                            if (issue.size._serials) {
                                return_action = new Promise((resolve, reject) => {
                                    return issue.loancard_line.serial.update({
                                        issue_id: null,
                                        location_id: location.location_id
                                    })
                                    .then(result => {
                                        if (!result) reject(new Error('Serial not returned'))
                                        else         resolve({serial_id: issue.loancard_line.serial_id})
                                    })
                                    .catch(err => reject(err));
                                });
                            } else {
                                return_action = new Promise((resolve, reject) => {
                                    return m.stores.stocks.findOrCreate({
                                        where: {
                                            location_id: location.location_id,
                                            size_id:     issue.size_id
                                        },
                                        defaults: {_qty: 0}
                                    })
                                    .then(([stock, created]) => {
                                        return stock.increment('_qty', {by: issue._qty})
                                        .then(result => {
                                            if (!result) reject(new Error('Stock not incremented'))
                                            else         resolve({stock_id: stock.stock_id})
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                });
                            };
                            return_action()
                            .then(return_result => {
                                console.log('return result: ', return_result)
                                let update_actions = [];
                                update_actions.push(new Promise((resolve, reject) => {
                                    return issue.update({_status: 5})
                                    .then(result => {
                                        if (!result) reject(new Error('Issue not updated'))
                                        else         resolve('Issue updated')
                                    })
                                }));
                                update_actions.push(new Promise((resolve, reject) => {
                                    return issue.loancard_line.update({_status: 3})
                                    .then(result => {
                                        if (!result) reject(new Error('Loancard not updated'))
                                        else         resolve('Loancard updated')
                                    })
                                }));
                                Promise.all(update_actions)
                                .then(update_results => {
                                    console.log('update results', update_results);
                                    return m.stores.issue_actions.create({
                                        issue_id:         issue.issue_id,
                                        _action:          'Returned',
                                        stock_id:         return_result.stock_id || null,
                                        serial_id:        return_result.serial_id || null,
                                        nsn_id:           issue.loancard_line.nsn_id || null,
                                        loancard_line_id: issue.loancard_line.line_id,
                                        user_id:          user_id
                                    })
                                    .then(action => resolve({success: false, message: 'Line returned'}))
                                    .catch(err => {
                                        console.log(err);
                                        resolve({success: true, message: 'Line returned, Error creating action'});
                                    });
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        };
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};