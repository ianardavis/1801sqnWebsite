const op = require('sequelize').Op;
module.exports = (app, allowed, inc, loggedIn, m) => {
    let receipts = {}, loancards = {},
        promiseResults = require('../functions/promise_results'),
        counter        = require('../functions/counter'),
        download       = require('../functions/download'),
        timestamp      = require('../functions/timestamps');
    require('./functions/loancards') (m, inc, loancards),
    app.get('/stores/loancards',              loggedIn, allowed('access_loancards'),                    (req, res) => res.render('stores/loancards/index'));
    app.get('/stores/loancards/:id',          loggedIn, allowed('access_loancards'),                    (req, res) => res.render('stores/loancards/show'));
    app.get('/stores/loancards/:id/download', loggedIn, allowed('access_loancards'),                    (req, res) => {
        m.stores.loancards.findOne({
            where: {loancard_id: req.params.id},
            attributes: ['_filename']
        })
        .then(loancard => {
            if (loancard._filename && loancard._filename !== '') download(loancard._filename, req, res);
            else res.error.redirect(new Error('No file found'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    app.get('/stores/count/loancards',        loggedIn, allowed('access_loancards',      {send: true}), (req, res) => {
        m.stores.loancards.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: 'Error counting loancards'})
        });
    });
    app.get('/stores/get/loancard',           loggedIn, allowed('access_loancards',      {send: true}), (req, res) => {
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
    app.get('/stores/get/loancards',          loggedIn, allowed('access_loancards',      {send: true}), (req, res) => {
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
    app.get('/stores/get/loancard_lines',     loggedIn, allowed('access_loancard_lines', {send: true}), (req, res) => {
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
    app.get('/stores/get/loancard_line',      loggedIn, allowed('access_loancard_lines', {send: true}), (req, res) => {
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

    app.post('/stores/loancards',             loggedIn, allowed('loancard_add',          {send: true}), (req, res) => {
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

    app.put('/stores/loancards/raise/:id',    loggedIn, allowed('access_loancards'),                    (req, res) => {
        loancards.createPDF(req.params.id)
        .then(loancard => res.send({success: true, message: 'Loancard raised'}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error raising loancard: ${err.message}`});
        });
    });
    app.put('/stores/loancards/:id',          loggedIn, allowed('loancard_edit',         {send: true}), (req, res) => {
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
    app.put('/stores/loancard_lines/:id',     loggedIn, allowed('receipt_add',           {send: true}), (req, res) => {
        m.stores.loancards.findOne({
            where: {loancard_id: req.params.id},
            attributes: ['loancard_id', 'supplier_id']
        })
        .then(loancard => {
            let actions = [], receives = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                if      (line._status === '3') receives.push(line);
                else if (line._status === '0') {
                    actions.push(
                        m.stores.loancard_lines.update(
                            {_status: 0},
                            {where: {line_id: line.line_id}}
                        )
                    );
                    actions.push(
                        new Promise((resolve, reject) => {
                            m.stores.order_line_actions.findAll({
                                where: {
                                    _action: 'Loancard',
                                    action_line_id: line.line_id
                                },
                                attributes: ['order_line_id']
                            })
                            .then(actions => {
                                if (actions.length > 0) {
                                    let order_actions = [];
                                    actions.forEach(e => {
                                        order_actions.push(
                                            m.stores.order_lines.update(
                                                {_status: 2},
                                                {where: {
                                                    line_id: e.order_line_id,
                                                    _status: 3
                                                }}
                                            )
                                        );
                                        order_actions.push(
                                            m.stores.order_line_actions.create({
                                                order_line_id:  e.order_line_id,
                                                action_line_id: line.line_id,
                                                _action:        'Loancard line cancelled',
                                                user_id:        req.user.user_id
                                            })
                                        );
                                    });
                                    Promise.all(order_actions)
                                    .then(result => resolve(result))
                                    .catch(err => reject(err));
                                } else resolve(true);
                            })
                            .catch(err => reject(err));
                        }),
                    );
                    actions.push(
                        m.stores.loancard_line_actions.create({
                            loancard_line_id: line.line_id,
                            _action:        `Cancelled`,
                            user_id:        req.user.user_id
                        })
                    );
                };
            };
            if (receives.length > 0) {
                actions.push(
                    new Promise((resolve, reject) => {
                        receipts.create({
                            receipt: {
                                supplier_id: loancard.supplier_id,
                                user_id:     req.user.user_id
                            }
                        })
                        .then(result => {
                            let receive_actions = [];
                            receives.forEach(line => {
                                receive_actions.push(
                                    receive_loancard_line(
                                        line,
                                        result.receipt_id,
                                        req.user.user_id
                                    )
                                );
                            });
                            Promise.all(receive_actions)
                            .then(results => resolve(results))
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                );
            };
            Promise.allSettled(actions)
            .then(results => {
                if (promiseResults(results)) res.send({success: true,  message: 'Lines actioned'})
                else                         res.send({success: false, message: 'Some actions failed'});
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.delete('/stores/loancards/:id',       loggedIn, allowed('loancard_delete',       {send: true}), (req, res) => {
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
    app.delete('/stores/loancard_lines/:id',  loggedIn, allowed('loancard_line_delete',  {send: true}), (req, res) => {
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

    function get_loancard(loancard_id) {
        return new Promise((resolve, reject) => {
            return m.stores.loancards.findOne({
                where: {loancard_id: loancard_id},
                includes: [
                    // inc.users({as: 'user'}),
                    // inc.users({as: 'user_loancard'})
                ]
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
                    return get_loancard_lines(loancard_id, 1)
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
                                            loancard_id: loancard_id,
                                            _status: 1
                                        }}
                                    )
                                    .then(result => {
                                        if (!result) reject(new Error('Lines not updated'))
                                        else {
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