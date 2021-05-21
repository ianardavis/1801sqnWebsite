module.exports = (app, m, pm, op, inc, li, send_error) => {
    let fn = {};
    require(`${process.env.FUNCS}/allowed`)(m.permissions, fn)
    require(`${process.env.FUNCS}/loancards`) (m, inc, fn, op);
    require(`${process.env.FUNCS}/locations`) (m, fn);
    app.get('/loancards',              li, pm.get('access_loancards'),                  (req, res) => res.render('stores/loancards/index'));
    app.get('/loancards/:id',          li, pm.get('access_loancards'),                  (req, res) => res.render('stores/loancards/show'));
    app.get('/loancards/:id/download', li, pm.check('access_loancards'),                (req, res) => {
        fn.loancards.get(req.params.id)
        .then(loancard => {
            if (!loancard.filename) send_error(res, 'No file found')
            else {
                res.download(`${process.env.ROOT}/public/res/loancards/${loancard.filename}`, function (err) {
                    if (err) console.log(err);
                });
            };
        })
        .catch(err => send_error(res, err));
    });

    app.get('/count/loancards',        li, pm.check('access_loancards'),                (req, res) => {
        m.loancards.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/loancard',           li, pm.check('access_loancards'),                (req, res) => {
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
    app.get('/get/loancards',          li, pm.check('access_loancards', {allow: true}), (req, res) => {
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
    app.get('/get/loancard_lines',     li, pm.check('access_loancard_lines'),           (req, res) => {
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
    app.get('/get/loancard_line',      li, pm.check('access_loancard_lines'),           (req, res) => {
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

    app.post('/loancards',             li, pm.check('loancard_add'),                    (req, res) => {
        fn.loancards.create({
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

    app.put('/loancards/:id',          li, pm.check('loancard_edit'),                   (req, res) => {
        fn.loancards.complete({
            loancard_id: req.params.id,
            user_id: req.user.user_id
        })
        .then(result => {
            return fn.loancards.createPDF(req.params.id)
            .then(filename => res.send({success: true, message: `Loancard completed. Filename: ${filename}`}))
            .catch(err =>     res.send({success: true, message: `Loancard completed. Error creating PDF: ${err.message}`}));
        })
        .catch(err => send_error(res, err));
    });
    app.put('/loancard_lines',         li, pm.check('loancard_line_edit'),              (req, res) => {
        let actions = [],
            cancels = req.body.actions.filter(e => e._status === '0'),
            returns = req.body.actions.filter(e => e._status === '3');
        if (cancels.length > 0) actions.push(cancel_lines(cancels, req.user.user_id));
        if (returns.length > 0) actions.push(return_lines(returns, req.user.user_id));
        Promise.all(actions)
        .then(results => res.send({success: true, message: 'Lines actioned'}))
        .catch(err => send_error(res, err));
    });
    
    app.delete('/loancards/:id',       li, pm.check('loancard_delete'),                 (req, res) => {
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
    app.delete('/loancard_lines/:id',  li, pm.check('loancard_line_delete'),            (req, res) => {
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
    function return_lines(lines, user_id) {
        console.log(lines);
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        return fn.locations.check(line.location)
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
};