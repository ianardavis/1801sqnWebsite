const op = require('sequelize').Op;
module.exports = (app, al, inc, pm, m) => {
    let loancards = {}, locations = {}, allowed = require('../functions/allowed');
    require('./functions/loancards') (m, inc, loancards);
    require('./functions/locations') (m, locations);
    app.get('/stores/loancards',              pm, al('access_loancards'),                    (req, res) => res.render('stores/loancards/index'));
    app.get('/stores/loancards/:id',          pm, al('access_loancards'),                    (req, res) => res.render('stores/loancards/show'));
    app.get('/stores/loancards/:id/download', pm, al('access_loancards'),                    (req, res) => {
        m.stores.loancards.findOne({
            where: {loancard_id: req.params.id},
            attributes: ['_filename']
        })
        .then(loancard => {
            if      (!loancard)                                        res.render('stores/download/error', {error: 'Loancard not found'})
            else if (!loancard._filename || loancard._filename === '') res.render('stores/download/error', {error: 'No file found'})
            else {
                res.download(`${process.env.ROOT}/public/res/loancards/${loancard._filename}`, function (err) {
                    if (err) console.log(err);
                });
            };
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    app.get('/stores/count/loancards',        pm, al('access_loancards',      {send: true}), (req, res) => {
        m.stores.loancards.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: 'Error counting loancards'})
        });
    });
    app.get('/stores/get/loancard',           pm, al('access_loancards',      {send: true}), (req, res) => {
        m.stores.loancards.findOne({
            where: req.query,
            include: [
                inc.loancard_lines(),
                inc.users({as: 'user'}),
                inc.users({as: 'user_loancard'})
            ]
        })
        .then(loancard => {
            if (loancard) res.send({success: true,  result: loancard})
            else          res.send({success: false, message: 'Loancard not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/loancards',          pm, al('access_loancards',      {send: true}), (req, res) => {
        m.stores.loancards.findAll({
            where:   req.query,
            include: [
                inc.loancard_lines(),
                inc.users({as: 'user'}),
                inc.users({as: 'user_loancard'})
            ]
        })
        .then(loancards => res.send({success: true, result: loancards}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/loancard_lines',     pm, al('access_loancard_lines', {send: true}), (req, res) => {
        m.stores.loancard_lines.findAll({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.users(),
                inc.loancards()
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/loancard_line',      pm, al('access_loancard_lines', {send: true}), (req, res) => {
        m.stores.loancard_lines.findOne({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.users(),
                inc.loancards(),
                inc.actions({include: [inc.orders()]})
            ]
        })
        .then(loancard_line => res.send({success: true, result: loancard_line}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/loancards',             pm, al('loancard_add',          {send: true}), (req, res) => {
        loancards.create({
            loancard: {
                user_id_loancard: req.body.supplier_id,
                user_id:     req.user.user_id
            }
        })
        .then(loancard => {
            if (loancard.created) res.send({success: true, message: 'There is already a loancard open for this user'})
            else                  res.send({success: true, message: 'Loancard raised'});
        })
        .catch(err => res.error.send(err, res));
    });

    app.put('/stores/loancards/raise/:id',    pm, al('access_loancards'),                    (req, res) => {
        loancards.createPDF(req.params.id)
        .then(loancard => res.send({success: true, message: 'Loancard raised'}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error raising loancard: ${err.message}`});
        });
    });
    app.put('/stores/loancards/:id',          pm, al('loancard_edit',         {send: true}), (req, res) => {
        if (Number(req.body._status) === 2) {
            complete_loancard(req.params.id, req.user.user_id)
            .then(result => {
                return loancards.createPDF(req.params.id)
                .then(filename => res.send({success: true, message: `Loancard completed. Filename: ${filename}`}))
                .catch(err =>     res.send({success: true, message: `Loancard completed. Error creating PDF: ${err.message}`}))
            })
            .catch(err => {
                console.log(err);
                res.send({success: false, message: `Error completing loancard: ${err.message}`});
            });
        } else if (Number(req.body._status) === 3) {
            close_loancard(req.params.id, req.user.user_id)
            .then(result => res.send({success: true, message: 'Loancard closed.'}))
            .catch(err => {
                console.log(err);
                res.send({success: false, message: `Error closing loancard: ${err.message}`});
            });
        } else res.send({success: false, message: 'Invalid request'});
    });
    app.put('/stores/loancard_lines',         pm, al('loancard_line_edit',    {send: true}), (req, res) => {
        let actions = [],
            cancels = req.body.actions.filter(e => e._status === '0'),
            returns = req.body.actions.filter(e => e._status === '3');
        if (cancels.length > 0) actions.push(cancel_lines(cancels, req.user.user_id));
        if (returns.length > 0) actions.push(return_lines(returns, req.user.user_id));
        Promise.all(actions)
        .then(results => res.send({success: true, message: 'Lines actioned'}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error actioning lines: ${err.message}`});
        });
    });
    
    app.delete('/stores/loancards/:id',       pm, al('loancard_delete',       {send: true}), (req, res) => {
        m.stores.loancards.findOne({
            where:      {loancard_id: req.params.id},
            include:    [inc.loancard_lines({where: {_status: {[op.not]: 0}}})],
            attributes: ['loancard_id', '_status']
        })
        .then(loancard => {
            if      (!loancard)                                 res.send({success: false, message: 'Loancard not found'})
            else if (loancard._status === 0)                    res.send({success: false, message: 'This loancard is already cancelled'})
            else if (loancard.lines && loancard.lines.length > 0) res.send({success: false, message: 'Can not cancel a loancard with it has pending, open or received lines'})
            else {
                loancard.update({_status: 0})
                .then(result => {
                    if (!result) res.send({success: false, message: `Error updating loancard: ${err.message}`})
                    else {
                        m.stores.notes.create({
                            _id: loancard.loancard_id,
                            _table: 'loancards',
                            _note: 'Cancelled',
                            _system: 1,
                            user_id: req.user.user_id
                        })
                        .then(note => res.send({success: true,  message: 'Loancard Cancelled'}))
                        .catch(err => {
                            console.log(err);
                            res.send({success: true, message: `Loancard cancelled. Error updating loancard: ${err.message}`})
                        });
                    };
                })
                .catch(err => {
                    console.log(err);
                    res.send({success: false, message: `Error updating loancard: ${err.message}`});
                })
            };
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting loancard: ${err.message}`});
        });
    });
    app.delete('/stores/loancard_lines/:id',  pm, al('loancard_line_delete',  {send: true}), (req, res) => {
        m.stores.loancard_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['line_id', '_status']
        })
        .then(line => {
            if      (line._status === 0) res.send({succes: false, message: 'This line has already been cancelled'})
            else if (line._status === 3) res.send({succes: false, message: 'This line has already been received'})
            else {
                line.update({_status: 0})
                .then(result => {
                    if (!result) res.send({success: false, message: 'Line not updated'})
                    else {
                        m.stores.notes.create({
                            _table:  'loancard_lines',
                            _note:   `Line ${req.params.id} cancelled`,
                            _id:     line.line_id,
                            user_id: req.user.user_id,
                            system:  1
                        })
                        .then(result => res.send({success: true, message: 'Line cancelled'}))
                        .catch(err => {
                            console.log(err);
                            res.send({success: true, message: `Line cancelled. Error creating note: ${err.message}`});
                        });
                    };
                })
                .catch(err => {
                    console.log(err);
                    res.send({success: false, message: `Error updating line: ${err.message}`});
                });
            };
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting line: ${err.message}`});
        });
    });

    function cancel_lines(lines, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(m.stores.permissions, user_id, 'loancard_line_cancel')
            .then(permission => {
                let actions = [];
                lines.forEach(line => {
                    actions.push(
                        new Promise((resolve, reject) => {
                            return m.stores.loancard_lines.findOne({
                                where:      {line_id: line.line_id},
                                attributes: ['line_id', '_status']
                            })
                            .then(line => {
                                if (!line) reject(new Error)
                                else {
                                    return line.update({_status: 0})
                                    .then(result => {
                                        if (!result) reject(new Error('Line not updated'))
                                        else {
                                            return m.stores.actions.findAll({
                                                where: {
                                                    loancard_line_id: line.line_id,
                                                    issue_id:         {[op.not]: null},
                                                    _action:          'Added to loancard'
                                                },
                                                attributes: ['action_id', 'issue_id', 'serial_id', 'location_id']
                                            })
                                            .then(actions => {
                                                let update_issues = [];
                                                actions.forEach(action => {
                                                    update_issues.push(
                                                        new Promise((resolve, reject) => {
                                                            return m.stores.issues.findOne({
                                                                where:      {issue_id: action.issue_id},
                                                                attributes: ['issue_id', '_status']
                                                            })
                                                            .then(issue => {
                                                                if (issue._status === 4) {
                                                                    return issue.update({_status: 2})
                                                                    .then(results => {
                                                                        return m.stores.actions.create({
                                                                            issue_id: issue.issue_id,
                                                                            loancard_line_id: line.line_id,
                                                                            _action: 'Loancard line cancelled',
                                                                            user_id: user_id
                                                                        })
                                                                        .then(action => resolve(true))
                                                                        .catch(err => reject(err));
                                                                    })
                                                                    .catch(err => reject(err));
                                                                } else resolve(false)
                                                            })
                                                            .catch(err => reject(err));
                                                        })
                                                    );
                                                });
                                                return Promise.all(update_issues)
                                                .then(results => resolve(true))
                                                .catch(err => reject(err));
                                            })
                                            .catch(err => reject(err));
                                        };
                                    })
                                    .catch(err => reject(err));
                                };
                            })
                            .catch(err => reject(err));
                        })
                    );
                });
                return Promise.all(actions)
                .then(results => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function return_lines(lines, user_id) {
        console.log(lines);
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        return locations.check(line.location)
                        .then(location_id => {
                            return m.stores.loancard_lines.findOne({
                                where:      {line_id: line.line_id},
                                include:    [inc.sizes({attributes: ['_serials']})],
                                attributes: ['line_id', '_status', 'size_id', 'serial_id', '_qty']
                            })
                            .then(line => {
                                if      (!line)              reject(new Error('Loancard line not found'))
                                else if (!line.size)         reject(new Error('Size not found'))
                                else if (line._status !== 2) reject(new Error('This line is not issued'))
                                else {
                                    if (line.serial_id) {
                                        return m.stores.serials.findOne({
                                            where:      {serial_id: line.serial_id},
                                            attributes: ['serial_id', 'location_id', 'issue_id']
                                        })
                                        .then(serial => {
                                            if (!serial) reject(new Error('Serial not found'))
                                            else {
                                                let update_actions = [];
                                                update_actions.push(serial.update({issue_id: null, location_id: location_id}));
                                                update_actions.push(line.update({_status: 3}));
                                                update_actions.push(
                                                    new Promise((resolve, reject) => {
                                                        return m.stores.actions.findOne({
                                                            where: {
                                                                loancard_line_id: line.line_id,
                                                                issue_id:         {[op.not]: null},
                                                                _action:          'Added to loancard'
                                                            },
                                                            attribute: ['action_id', 'issue_id']
                                                        })
                                                        .then(action => {
                                                            return m.stores.issues.findOne({
                                                                where:      {issue_id: action.issue_id},
                                                                attributes: ['issue_id', '_status']
                                                            })
                                                            .then(issue => {
                                                                if (!issue) reject(new Error('Issue not found'))
                                                                else {
                                                                    issue.update({_status: 5})
                                                                    .then(result => {
                                                                        if (!result) reject(new Error('Issue not updated'))
                                                                        else         resolve({issue_id: issue.issue_id});
                                                                    })
                                                                };
                                                            })
                                                            .catch(err => reject(err));
                                                        })
                                                        .catch(err => reject(err));
                                                    })
                                                );
                                                return Promise.all(update_actions)
                                                .then(results => {
                                                    let issue = results.filter(e => e.issue_id)[0];
                                                    if (!issue) reject(new Error('Issue ID not found'))
                                                    else {
                                                        return m.stores.actions.create({
                                                            issue_id:         issue.issue_id,
                                                            loancard_line_id: line.line_id,
                                                            serial_id:        serial.serial_id,
                                                            _action:          'Line returned',
                                                            user_id:          user_id
                                                        })
                                                        .then(action => resolve(true))
                                                        .catch(err => reject(err));
                                                    };
                                                })
                                                .catch(err => reject(err));
                                            };
                                        })
                                        .catch(err => reject(err));
                                    } else {
                                        return m.stores.stocks.findOrCreate({
                                            where: {
                                                location_id: location_id,
                                                size_id:     line.size_id
                                            }
                                        })
                                        .then(([stock, created]) => {
                                            let update_actions = [];
                                            update_actions.push(stock.increment('_qty', {by: line._qty}));
                                            update_actions.push(line.update({_status: 3}));
                                            update_actions.push(
                                                new Promise((resolve, reject) => {
                                                    return m.stores.actions.findAll({
                                                        where: {
                                                            loancard_line_id: line.line_id,
                                                            issue_id:         {[op.not]: null},
                                                            _action:          'Added to loancard'
                                                        },
                                                        attribute: ['action_id', 'issue_id']
                                                    })
                                                    .then(_actions => {
                                                        let return_actions = [];
                                                        _actions.forEach(action => {
                                                            return_actions.push(
                                                                new Promise((resolve, reject) => {
                                                                    return m.stores.issues.findOne({
                                                                        where:      {issue_id: action.issue_id},
                                                                        attributes: ['issue_id', '_status']
                                                                    })
                                                                    .then(issue => {
                                                                        if (!issue) reject(new Error('Issue not found'))
                                                                        else {
                                                                            return issue.update({_status: 5})
                                                                            .then(result => {
                                                                                if (!result) reject(new Error('Issue not updated'))
                                                                                else {
                                                                                    return m.stores.actions.create({
                                                                                        issue_id:         issue.issue_id,
                                                                                        loancard_line_id: line.line_id,
                                                                                        stock_id:         stock.stock_id,
                                                                                        _action:          'Line returned',
                                                                                        user_id:          user_id
                                                                                    })
                                                                                    .then(action => resolve(true))
                                                                                    .catch(err => reject(err));
                                                                                };
                                                                            })
                                                                        };
                                                                    })
                                                                    .catch(err => reject(err));
                                                                })
                                                            );
                                                        });
                                                        return Promise.all(return_actions)
                                                        .then(results => resolve(true))
                                                        .catch(err => reject(err));
                                                    })
                                                    .catch(err => reject(err));
                                                })
                                            );
                                            return Promise.all(update_actions)
                                            .then(results => resolve(true))
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    };
                                };
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                );
            });
            Promise.all(actions)
            .then(results => resolve(true))
            .catch(err => reject(err));
        });
    };

    function get_loancard(loancard_id) {
        return new Promise((resolve, reject) => {
            return m.stores.loancards.findOne({
                where:      {loancard_id: loancard_id},
                attributes: ['loancard_id', '_status']
            })
            .then(loancard => {
                if (!loancard) reject(new Error('Loancard not found'))
                else resolve(loancard);
            })
            .catch(err => reject(err));
        })
    };
    function get_loancard_lines(loancard_id, _status) {
        return new Promise((resolve, reject) => {
            return m.stores.loancard_lines.findAll({
                where: {
                    loancard_id: loancard_id,
                    _status:     _status
                },
                include: [
                    // inc.users(),
                    // inc.sizes()
                ]
            })
            .then(lines => {
                if (!lines || lines.length === 0) reject(new Error('No lines'))
                else resolve(lines);
            })
            .catch(err => reject(err));
        });
    };
    function complete_loancard(loancard_id, user_id) {
        return new Promise((resolve, reject) => {
            return get_loancard(loancard_id)
            .then(loancard => {
                if (loancard._status !== 1) reject(new Error('Loancard is not in draft'))
                else {
                    return get_loancard_lines(loancard.loancard_id, 1)
                    .then(lines => {
                        if (!lines || lines.length === 0) reject(new Error('No lines'))
                        else {
                            return loancard.update({_status: 2})
                            .then(result => {
                                if (!result) reject(new Error('Loancard not updated'))
                                else {
                                    return m.stores.loancard_lines.update(
                                        {_status: 2},
                                        {where: {
                                            loancard_id: loancard.loancard_id,
                                            _status:     1
                                        }}
                                    )
                                    .then(result => {
                                        if (!result) reject(new Error('Lines not updated'))
                                        else {
                                            let stock_actions = [];
                                            lines.forEach(line => {
                                                stock_actions.push(
                                                    new Promise((resolve, reject) => {
                                                        return m.stores.actions.findAll({
                                                            where: {
                                                                loancard_line_id: line.line_id,
                                                                _action:          'Added to loancard'
                                                            },
                                                            attributes: ['action_id', 'issue_id', 'serial_id', 'stock_id', 'location_id']
                                                        })
                                                        .then(actions => {
                                                            actions.forEach(action => {
                                                                if (action.serial_id) {
                                                                    return m.stores.serials.findOne({
                                                                        where:      {serial_id: action.serial_id},
                                                                        attributes: ['serial_id', 'location_id', 'issue_id']
                                                                    })
                                                                    .then(serial => {
                                                                        if      (!serial)         reject(new Error('Serial not found'))
                                                                        else if (serial.issue_id) reject(new Error('Serial is already issued'))
                                                                        else {
                                                                            return serial.update({location_id: null, issue_id: action.issue_id})
                                                                            .then(result => {
                                                                                if (!result) reject(new Error('Serial not updated'))
                                                                                else         resolve(true);
                                                                            })
                                                                        };
                                                                    })
                                                                    .catch(err => reject(err));
                                                                } else if (action.stock_id) {
                                                                    return m.stores.stocks.findOne({
                                                                        where:      {stock_id: action.stock_id},
                                                                        attributes: ['stock_id', 'location_id', '_qty']
                                                                    })
                                                                    .then(stock => {
                                                                        if (!stock) reject(new Error('Stock record not found'))
                                                                        else {
                                                                            return stock.decrement('_qty', {by: line._qty})
                                                                            .then(result => {
                                                                                if (!result) reject(new Error('Stock record not updated'))
                                                                                else         resolve(true);
                                                                            })
                                                                        };
                                                                    })
                                                                    .catch(err => reject(err));
                                                                } else reject(new Error('No stock or serial'));
                                                            });
                                                        })
                                                        .catch(err => reject(err));
                                                    })
                                                );
                                            });
                                            Promise.all(stock_actions)
                                            .then(results => {
                                                let create_notes = [];
                                                create_notes.push(
                                                    m.stores.notes.create({
                                                        _note:   'Loancard completed',
                                                        _table:  'loancards',
                                                        _id:     loancard.loancard_id,
                                                        _system: 1,
                                                        user_id: user_id
                                                    })
                                                );
                                                lines.forEach(line => {
                                                    create_notes.push(
                                                        m.stores.notes.create({
                                                            _note:   'Loancard completed',
                                                            _table:  'loancard_lines',
                                                            _id:     line.line_id,
                                                            _system: 1,
                                                            user_id: user_id
                                                        })
                                                    );
                                                });
                                                return Promise.all(create_notes)
                                                .then(results => resolve(true))
                                                .catch(err =>    resolve(false));
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
                }; 
            })
            .catch(err => reject(err));
        });
    };
    function close_loancard(loancard_id, user_id) {
        return new Promise((resolve, reject) => {
            return get_loancard(loancard_id)
            .then(loancard => {
                if (loancard._status !== 2) reject(new Error('Loancard is not complete'))
                else {
                    return get_loancard_lines(loancard_id, 2)
                    .then(lines => {
                        if (lines && lines.length > 0) reject(new Error('Can not close a loancard with open lines'))
                        else {
                            return loancard.update({_status: 2})
                            .then(result => {
                                if (!result) reject(new Error('Loancard not updated'))
                                else {
                                    return m.stores.notes.create({
                                        _note:   'Loancard closed',
                                        _id:     loancard.loancard_id,
                                        _table:  'loancards',
                                        _system: 1,
                                        user_id: user_id
                                    })
                                    .then(results => resolve({success: true, message: 'Loancard created'}))
                                    .catch(err =>    resolve({success: true, message: `Loancard created. Error creating notes: ${err.message}`}));
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
};