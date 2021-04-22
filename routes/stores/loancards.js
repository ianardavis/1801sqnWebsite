module.exports = (app, m, pm, op, inc, li, send_error) => {
    let loancards = {}, locations = {}, allowed = require('../functions/allowed');
    require('./functions/loancards') (m, inc, loancards);
    require('./functions/locations') (m, locations);
    app.get('/loancards',              li, pm.get, pm.check('access_loancards'),                                 (req, res) => res.render('stores/loancards/index'));
    app.get('/loancards/:id',          li, pm.get, pm.check('access_loancards'),                                 (req, res) => res.render('stores/loancards/show'));
    app.get('/loancards/:id/download', li,         pm.check('access_loancards'),                                 (req, res) => {
        m.loancards.findOne({
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

    app.get('/count/loancards',        li,         pm.check('access_loancards',      {send: true}),              (req, res) => {
        m.loancards.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/loancard',           li,         pm.check('access_loancards',      {send: true}),              (req, res) => {
        m.loancards.findOne({
            where: req.query,
            include: [
                inc.loancard_lines(),
                inc.user(),
                inc.user({as: 'user_loancard'})
            ]
        })
        .then(loancard => {
            if (loancard) res.send({success: true,  result: loancard})
            else          send_error(res, 'Loancard not found');
        })
        .catch(err => send_error(res, err));
    });
    app.get('/get/loancards',          li,         pm.check('access_loancards',      {send: true, allow: true}), (req, res) => {
        if (!req.allowed) req.query.user_id_loancard = req.user.user_id;
        m.loancards.findAll({
            where: req.query,
            include: [
                inc.loancard_lines(),
                inc.user({as: 'user'}),
                inc.user({as: 'user_loancard'})
            ]
        })
        .then(loancards => res.send({success: true, result: loancards}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/loancard_lines',     li,         pm.check('access_loancard_lines', {send: true}),              (req, res) => {
        m.loancard_lines.findAll({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.loancard({include: [inc.user(), inc.user({as: 'user_loancard'})]})
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/loancard_line',      li,         pm.check('access_loancard_lines', {send: true}),              (req, res) => {
        m.loancard_lines.findOne({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.loancard({include: [inc.user(), inc.user({as: 'user_loancard'})]}),
                inc.actions({include: [inc.order()]})
            ]
        })
        .then(loancard_line => res.send({success: true, result: loancard_line}))
        .catch(err => send_error(res, err));
    });

    app.post('/loancards',             li,         pm.check('loancard_add',          {send: true}),              (req, res) => {
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
        .catch(err => send_error(res, err));
    });

    app.put('/loancards/raise/:id',    li,         pm.check('access_loancards'),                                 (req, res) => {
        loancards.createPDF(req.params.id)
        .then(loancard => res.send({success: true, message: 'Loancard raised'}))
        .catch(err => send_error(res, err));
    });
    app.put('/loancards/:id',          li,         pm.check('loancard_edit',         {send: true}),              (req, res) => {
        if (Number(req.body._status) === 2) {
            complete_loancard(req.params.id, req.user.user_id)
            .then(result => {
                return loancards.createPDF(req.params.id)
                .then(filename => res.send({success: true, message: `Loancard completed. Filename: ${filename}`}))
                .catch(err =>     res.send({success: true, message: `Loancard completed. Error creating PDF: ${err.message}`}))
            })
            .catch(err => send_error(res, err));
        } else if (Number(req.body._status) === 3) {
            close_loancard(req.params.id, req.user.user_id)
            .then(result => res.send({success: true, message: 'Loancard closed.'}))
            .catch(err => send_error(res, err));
        } else send_error(res, 'Invalid request');
    });
    app.put('/loancard_lines',         li,         pm.check('loancard_line_edit',    {send: true}),              (req, res) => {
        let actions = [],
            cancels = req.body.actions.filter(e => e._status === '0'),
            returns = req.body.actions.filter(e => e._status === '3');
        if (cancels.length > 0) actions.push(cancel_lines(cancels, req.user.user_id));
        if (returns.length > 0) actions.push(return_lines(returns, req.user.user_id));
        Promise.all(actions)
        .then(results => res.send({success: true, message: 'Lines actioned'}))
        .catch(err => send_error(res, err));
    });
    
    app.delete('/loancards/:id',       li,         pm.check('loancard_delete',       {send: true}),              (req, res) => {
        m.loancards.findOne({
            where:      {loancard_id: req.params.id},
            include:    [inc.loancard_lines({where: {_status: {[op.not]: 0}}})],
            attributes: ['loancard_id', '_status']
        })
        .then(loancard => {
            if      (!loancard)                                   send_error(res, 'Loancard not found')
            else if (loancard._status === 0)                      send_error(res, 'This loancard is already cancelled')
            else if (loancard.lines && loancard.lines.length > 0) send_error(res, 'Can not cancel a loancard with it has pending, open or received lines')
            else {
                loancard.update({_status: 0})
                .then(result => {
                    if (!result) send_error(res, `Error updating loancard: ${err.message}`)
                    else {
                        m.notes.create({
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
                .catch(err => send_error(res, err))
            };
        })
        .catch(err => send_error(res, err));
    });
    app.delete('/loancard_lines/:id',  li,         pm.check('loancard_line_delete',  {send: true}),              (req, res) => {
        m.loancard_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['line_id', '_status']
        })
        .then(line => {
            if      (line._status === 0) res.send({succes: false, message: 'This line has already been cancelled'})
            else if (line._status === 3) res.send({succes: false, message: 'This line has already been received'})
            else {
                line.update({_status: 0})
                .then(result => {
                    if (!result) send_error(res, 'Line not updated')
                    else {
                        m.notes.create({
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
                .catch(err => send_error(res, err));
            };
        })
        .catch(err => send_error(res, err));
    });

    function cancel_lines(lines, user_id) {
        return new Promise((resolve, reject) => {
            return allowed(m.permissions, user_id, 'loancard_line_cancel')
            .then(permission => {
                let actions = [];
                lines.forEach(line => {
                    actions.push(
                        new Promise((resolve, reject) => {
                            return m.loancard_lines.findOne({
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
                                            return m.actions.findAll({
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
                                                            return m.issues.findOne({
                                                                where:      {issue_id: action.issue_id},
                                                                attributes: ['issue_id', '_status']
                                                            })
                                                            .then(issue => {
                                                                if (issue._status === 4) {
                                                                    return issue.update({_status: 2})
                                                                    .then(results => {
                                                                        return m.actions.create({
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
                            return m.loancard_lines.findOne({
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
                                        return m.serials.findOne({
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
                                                        return m.actions.findOne({
                                                            where: {
                                                                loancard_line_id: line.line_id,
                                                                issue_id:         {[op.not]: null},
                                                                _action:          'Added to loancard'
                                                            },
                                                            attribute: ['action_id', 'issue_id']
                                                        })
                                                        .then(action => {
                                                            return m.issues.findOne({
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
                                                        return m.actions.create({
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
                                        return m.stocks.findOrCreate({
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
                                                    return m.actions.findAll({
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
                                                                    return m.issues.findOne({
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
                                                                                    return m.actions.create({
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
            return m.loancards.findOne({
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
            return m.loancard_lines.findAll({
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
                                    return m.loancard_lines.update(
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
                                                        return m.actions.findAll({
                                                            where: {
                                                                loancard_line_id: line.line_id,
                                                                _action:          'Added to loancard'
                                                            },
                                                            attributes: ['action_id', 'issue_id', 'serial_id', 'stock_id', 'location_id']
                                                        })
                                                        .then(actions => {
                                                            actions.forEach(action => {
                                                                if (action.serial_id) {
                                                                    return m.serials.findOne({
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
                                                                    return m.stocks.findOne({
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
                                                    m.notes.create({
                                                        _note:   'Loancard completed',
                                                        _table:  'loancards',
                                                        _id:     loancard.loancard_id,
                                                        _system: 1,
                                                        user_id: user_id
                                                    })
                                                );
                                                lines.forEach(line => {
                                                    create_notes.push(
                                                        m.notes.create({
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
                                    return m.notes.create({
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