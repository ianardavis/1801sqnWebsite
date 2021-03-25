module.exports = (app, m, pm, op, inc, send_error) => {
    let receipts = {}, demands = {},
        promiseResults = require('../functions/promise_results'),
        counter        = require('../functions/counter'),
        download       = require('../functions/download');
    // require('./functions/receipts')(m, receipts),
    require('./functions/demands') (m, demands),
    app.get('/demands',      pm.get, pm.check('access_demands'),                    (req, res) => res.render('stores/demands/index'));
    app.get('/demands/:id',  pm.get, pm.check('access_demands'),                    (req, res) => res.render('stores/demands/show'));
    app.get('/demands/:id/download', pm.check('access_demands'),                    (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['_filename']
        })
        .then(demand => {
            if (demand._filename && demand._filename !== '') download(demand._filename, req, res);
            else res.error.redirect(new Error('No file found'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    app.get('/count/demands',        pm.check('access_demands',      {send: true}), (req, res) => {
        m.demands.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: 'Error counting demands'})
        });
    });
    
    app.get('/get/demand',           pm.check('access_demands',      {send: true}), (req, res) => {
        m.demands.findOne({
            where: req.query,
            include: [
                inc.demand_lines(),
                inc.users(),
                inc.suppliers({as: 'supplier'})
            ]
        })
        .then(demand => {
            if (demand) res.send({success: true, result: demand})
            else        res.send({success: false, message: 'Demand not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/demands',          pm.check('access_demands',      {send: true}), (req, res) => {
        m.demands.findAll({
            where:   req.query,
            include: [
                inc.demand_lines(),
                inc.users(),
                inc.suppliers({as: 'supplier'})
            ]
        })
        .then(demands => res.send({success: true, result: demands}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/demand_lines',     pm.check('access_demand_lines', {send: true}), (req, res) => {
        m.demand_lines.findAll({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.users(),
                inc.demands()
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/get/demand_line',      pm.check('access_demand_lines', {send: true}), (req, res) => {
        m.demand_lines.findOne({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.users(),
                inc.demands(),
                inc.actions({include: [inc.orders()]})
            ]
        })
        .then(demand_line => res.send({success: true, result: demand_line}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/demands',             pm.check('demand_add',          {send: true}), (req, res) => {
        demands.create({
            demand: {
                supplier_id: req.body.supplier_id,
                user_id:     req.user.user_id
            }
        })
        .then(demand => {
            if (demand.created) res.send({success: true, message: 'There is already a demand open for this supplier'})
            else                res.send({success: true, message: 'Demand raised'});
        })
        .catch(err => res.error.send(err, res));
    });

    app.put('/demands/raise/:id',    pm.check('demand_edit',         {send: true}), (req, res) => {
        raise_demand(req.params.id, req.user.user_id)
        .then(result => res.send(result))
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error raising demand: ${err.message}`})
        });
    });
    app.put('/demands/:id',          pm.check('demand_edit',         {send: true}), (req, res) => {
        if (Number(req.body._status) === 2) {
            complete_demand(req.params.id, req.user.user_id)
            .then(filename => res.send({success: true,  message: `Demand completed. Filename: ${filename}`}))
            .catch(err => {
                console.log(err);
                res.send({success: false, message: `Error completing demand: ${err.message}`});
            });
        } else if (Number(req.body._status) === 3) {
            close_demand(req.params.id, req.user.user_id)
            .then(result =>   res.send({success: true,  message: 'Demand closed.'}))
            .catch(err => {
                console.log(err);
                res.send({success: false, message: `Error closing demand: ${err.message}`});
            });
        } else                res.send({success: false, message: 'Invalid request'});
    });
    app.put('/demand_lines/:id',     pm.check('receipt_add',         {send: true}), (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['demand_id', 'supplier_id']
        })
        .then(demand => {
            let actions = [], receives = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                if      (line._status === '3') receives.push(line);
                else if (line._status === '0') {
                    actions.push(
                        m.demand_lines.update(
                            {_status: 0},
                            {where: {line_id: line.line_id}}
                        )
                    );
                    actions.push(
                        new Promise((resolve, reject) => {
                            m.order_line_actions.findAll({
                                where: {
                                    _action: 'Demand',
                                    action_line_id: line.line_id
                                },
                                attributes: ['order_line_id']
                            })
                            .then(actions => {
                                if (actions.length > 0) {
                                    let order_actions = [];
                                    actions.forEach(e => {
                                        order_actions.push(
                                            m.order_lines.update(
                                                {_status: 2},
                                                {where: {
                                                    line_id: e.order_line_id,
                                                    _status: 3
                                                }}
                                            )
                                        );
                                        order_actions.push(
                                            m.order_line_actions.create({
                                                order_line_id:  e.order_line_id,
                                                action_line_id: line.line_id,
                                                _action:        'Demand line cancelled',
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
                        m.demand_line_actions.create({
                            demand_line_id: line.line_id,
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
                                supplier_id: demand.supplier_id,
                                user_id:     req.user.user_id
                            }
                        })
                        .then(result => {
                            let receive_actions = [];
                            receives.forEach(line => {
                                receive_actions.push(
                                    receive_demand_line(
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
    
    app.delete('/demands/:id',       pm.check('demand_delete',       {send: true}), (req, res) => {
        m.demands.findOne({
            where:      {demand_id: req.params.id},
            include:    [inc.demand_lines({where: {_status: {[op.not]: 0}}})],
            attributes: ['demand_id', '_status']
        })
        .then(demand => {
            if      (!demand)                                 res.send({success: false, message: 'Demand not found'})
            else if (demand._status === 0)                    res.send({success: false, message: 'This demand is already cancelled'})
            else if (demand.lines && demand.lines.length > 0) res.send({success: false, message: 'Can not cancel a demand with it has pending, open or received lines'})
            else {
                demand.update({_status: 0})
                .then(result => {
                    if (!result) res.send({success: false, message: `Error updating demand: ${err.message}`})
                    else {
                        m.notes.create({
                            _id: demand.demand_id,
                            _table: 'demands',
                            _note: 'Cancelled',
                            _system: 1,
                            user_id: req.user.user_id
                        })
                        .then(note => res.send({success: true,  message: 'Demand Cancelled'}))
                        .catch(err => {
                            console.log(err);
                            res.send({success: true, message: `Demand cancelled. Error updating demand: ${err.message}`})
                        });
                    };
                })
                .catch(err => {
                    console.log(err);
                    res.send({success: false, message: `Error updating demand: ${err.message}`});
                })
            };
        })
        .catch(err => {
            console.log(err);
            res.send({success: false, message: `Error getting demand: ${err.message}`});
        });
    });
    app.delete('/demand_lines/:id',  pm.check('demand_line_delete',  {send: true}), (req, res) => {
        m.demand_lines.findOne({
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
                        m.notes.create({
                            _table:  'demand_lines',
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

    function complete_demand(demand_id, user_id) {
        return new Promise((resolve, reject) => {
            m.demands.findOne({
                where:      {demand_id: demand_id},
                include:    [inc.demand_lines({where: {_status: 1}})],
                attributes: ['demand_id', '_status']
            })
            .then(demand => {
                if      (!demand)                                    reject(new Error('Demand not found'))
                else if (demand._status !== 1)                       reject(new Error('This demand is not in draft'))
                else if (!demand.lines || demand.lines.length === 0) reject(new Error('No pending lines for this demand'))
                else {
                    demand.update({_status: 2})
                    .then(result => {
                        if (!result) reject(new Error('demand not updated'))
                        else {
                            m.demand_lines.update(
                                {_status: 2},
                                {where: {
                                    demand_id: demand.demand_id,
                                    _status: 1
                                }
                            })
                            .then(result => {
                                if (!result) reject(new Error('Lines not updated'))
                                else {
                                    m.notes.create({
                                        _table: 'demands',
                                        _id: demand.demand_id,
                                        _note: 'Completed',
                                        _system: 1,
                                        user_id: user_id
                                    })
                                    .then(note => {
                                        raise_demand(demand.demand_id, user_id)
                                        .then(filename => resolve(filename))
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                                };
                            })
                            .catch(err => reject(err));
                        }
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function close_demand(demand_id, user_id) {
        return new Promise((resolve, reject) => {
            return m.demands.findOne({
                where: {demand_id: demand_id},
                include: [inc.demand_lines({where: {_status: {[op.or]: [1, 2]}}})],
                attributes: ['demand_id', '_status']
            })
            .then(demand => {
                if      (!demand)                                 reject(new Error('Demand not found'))
                else if (demand._status !== 2)                    reject(new Error('This demand is not complete'))
                else if (demand.lines && demand.lines.length > 0) reject(new Error('This demand has pending or open lines'))
                else {
                    demand.update({_status: 3})
                    .then(result => {
                        if (!result) reject(new Error('Demand not updated'))
                        else {
                            m.notes.create({
                                _table:  'demands',
                                _id:     demand.demand_id,
                                _note:   'Closed',
                                user_id: req.user.user_id,
                                _system:  1
                            })
                            .then(note => resolve(true))
                            .catch(err => {
                                console.log(err);
                                resolve({success: true, message: `Demand closed. Error creating note: ${err.message}`});
                            });
                        };
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };

    function raise_demand(demand_id, user_id) {
        return new Promise((resolve, reject) => {
            return m.demands.findOne({
                where: {demand_id: demand_id},
                attributes: ['demand_id', '_status', '_filename', 'supplier_id']
            })
            .then(demand => {
                if      (!demand)                                     reject(new Error('Demand not found'))
                if      (demand._status !== 2)                        reject(new Error('This demand is not complete'))
                else if (demand._filename && demand._filename !== '') reject(new Error('This demand has already been raised'))
                else {
                    return get_template(demand.supplier_id)
                    .then(([template, account, supplier_id]) => {
                        return get_lines(demand.demand_id)
                        .then(demand_lines => {
                            return get_orders(demand_lines)
                            .then(orders => {
                                return get_sizes(demand_lines, supplier_id)
                                .then(sizes => {
                                    return get_users(orders)
                                    .then(users => {
                                        return create_file(template, demand.demand_id)
                                        .then(file => {
                                            return write_cover_sheet(template, account, file, users)
                                            .then(result => {
                                                return write_items(file, sizes)
                                                .then(fails => {
                                                    if (fails && fails.length > 0) resolve({success: true, message: 'Demand raised, some items failed', file: file})
                                                    else                           resolve({success: true, message: 'Demand raised', file: file})
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
                            })
                            .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function get_template(supplier_id) {
        return new Promise((resolve, reject) => {
            return m.suppliers.findOne({
                where:      {supplier_id: supplier_id},
                include:    [
                    inc.files({
                        include:    [inc.file_details()],
                        attributes: ['file_id', '_filename'],
                        where:      {_description: 'Demand'}
                    }),
                    inc.accounts()
                ],
                attributes: ['supplier_id']
            })
            .then(supplier => {
                if      (!supplier)                   reject(new Error('Supplier not found'))
                else if (!supplier.files)             reject(new Error('No template for this supplier'))
                else if (supplier.files.length === 0) reject(new Error('No demand files for this supplier'))
                else if (supplier.files.length > 1)   reject(new Error('Multiple demand files for this supplier'))
                else if (!supplier.account)           reject(new Error('No account for this supplier'))
                else                                  resolve([supplier.files[0], supplier.account, supplier.supplier_id]);
            })
            .catch(err => reject(err));
        });
    };
    function get_lines(demand_id) {
        return new Promise((resolve, reject) => {
            return m.demand_lines.findAll({
                where: {
                    demand_id: demand_id,
                    _status: 2
                },
                include:    [inc.sizes({
                    attributes: ['size_id', 'supplier_id'],
                    include:    [inc.details()]
                })],
                attributes: ['line_id', 'size_id', '_qty', '_status']
            })
            .then(lines => {
                if (!lines || lines.length === 0) reject(new Error('No lines for this demand'))
                else                              resolve(lines)
            })
            .catch(err => reject(err));
        });
    };
    function get_orders(lines) {
        return new Promise((resolve, reject) => {
            let actions = [];
            lines.forEach(line => {
                actions.push(
                    new Promise((resolve, reject) => {
                        m.actions.findAll({
                            where:      {
                                demand_line_id: line.line_id,
                                order_id:       {[op.not]: null}
                            },
                            attributes: ['order_id']
                        })
                        .then(_actions => {
                            if (!_actions || _actions.length === 0) reject(new Error('No orders for this line'))
                            else {
                                let orders = [];
                                _actions.forEach(action => orders.push(action.order_id));
                                resolve(orders);
                            };
                        })
                        .catch(err => reject(err))
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                let orders = [];
                results.filter(e => e.status === 'fulfilled').forEach(e => orders = orders.concat(e.value));
                resolve(orders);
            })
            .catch(err => reject(err));
        });
    };
    function get_sizes(lines, supplier_id) {
        return new Promise((resolve, reject) => {
            let sizes = [];
            lines.forEach(line => {
                if (
                    line.size.supplier_id === supplier_id &&
                    line.size.details.findIndex(e => e._name === 'Demand Page') !== -1 &&
                    line.size.details.findIndex(e => e._name === 'Demand Cell') !== -1
                ) {
                    let demand_page = line.size.details[line.size.details.findIndex(e => e._name === 'Demand Page')]._value,
                        demand_cell = line.size.details[line.size.details.findIndex(e => e._name === 'Demand Cell')]._value;
                    if (
                        demand_page !== '' &&
                        demand_cell !== ''
                    ) {
                        let sizeIndex = sizes.findIndex(e => e.size_id === line.size_id);
                        if (sizeIndex === -1) {
                            sizes.push({
                                size_id: line.size_id,
                                qty:     line._qty,
                                page:    demand_page,
                                cell:    demand_cell
                            })
                        } else sizes[sizeIndex].qty += line._qty;
                    };
                };
            });
            if (sizes.length > 0) resolve(sizes)
            else                  reject(new Error('No sizes for this supplier with demand details'));
        });
    };
    function get_users(orders) {
        return new Promise((resolve, reject) => {
            let actions = [];
            orders.forEach(order => {
                actions.push(
                    new Promise((resolve, reject) => {
                        m.actions.findAll({
                            where:      {
                                order_id: order,
                                issue_id: {[op.not]: null}
                            },
                            include: [inc.issues()],
                            attributes: ['issue_id']
                        })
                        .then(_actions => {
                            if (!_actions || _actions.length === 0) reject(new Error('No issues for this order'))
                            else {
                                let issues = [];
                                _actions.forEach(action => {
                                    if (action.issue) issues.push(action.issue.user_issue);
                                });
                                if (!issues || issues.length === 0) reject(new Error('No issues for this order'))
                                else                                resolve(issues);
                            };
                        })
                        .catch(err => reject(err))
                    })
                );
            });
            Promise.allSettled(actions)
            .then(results => {
                let users = [];
                results.filter(e => e.status === 'fulfilled').forEach(e => {
                    e.value.forEach(user => {
                        if (users.findIndex(e => e.user_id === user.user_id) === -1) {
                            users.push({
                                user_id: user.user_id,
                                name:    user._name,
                                rank:    user.rank._rank,
                                ini:     user._ini
                            })
                        };
                    });
                });
                resolve(users);
            })
            .catch(err => reject(err));
        });
    };
    function create_file(file, demand_id) {
        return new Promise((resolve, reject) => {
            const fs = require('fs'),
                  { COPYFILE_EXCL } = fs.constants;
            if (file) {
                let path     = `${process.env.ROOT}/public/res`,
                    new_file = `demands/demand-${demand_id}.xlsx`;
                fs.copyFile(`${path}/files/${file._filename}`, `${path}/${new_file}`, COPYFILE_EXCL, function (err) {
                    if (err) {
                        if (err.code === 'EEXIST') reject(new Error('File already exists for this demand'))
                        else                       reject(new Error(err));
                    } else resolve(new_file);
                });
            } else reject(new Error('No demand file specified'));
        });
    };
    function write_cover_sheet(template, account, file, users) {
        return new Promise((resolve, reject) => {
            if (template.details.filter(e => e._name === 'Cover sheet').length === 1) {
                let ex       = require('exceljs'),
                    workbook = new ex.Workbook(),
                    path     = `${process.env.ROOT}/public/res/`;
                workbook.xlsx.readFile(`${path}/${file}`)
                .then(() => {
                    try {
                        let worksheet = workbook.getWorksheet(template._cover_sheet);
                        if (template.details.filter(e => e._name === 'Code').length === 1) {
                            let cell_code = worksheet.getCell(template.details.filter(e => e._name === 'Code')[0]._value);
                            cell_code.value = account._number;
                        };

                        if (template.details.filter(e => e._name === 'Rank').length === 1) {
                            let cell_rank = worksheet.getCell(template.details.filter(e => e._name === 'Rank')[0]._value);
                            cell_rank.value = account.user.rank._rank;
                        };

                        if (template.details.filter(e => e._name === 'Holder').length === 1) {
                            let cell_name = worksheet.getCell(template.details.filter(e => e._name === 'Holder')[0]._value);
                            cell_name.value = account.user._name;
                        };

                        if (template.details.filter(e => e._name === 'Squadron').length === 1) {
                            let cell_sqn = worksheet.getCell(template.details.filter(e => e._name === 'Squadron')[0]._value);
                            cell_sqn.value = account._name;
                        };

                        if (template.details.filter(e => e._name === 'Date').length === 1) {
                            let cell_date = worksheet.getCell(template.details.filter(e => e._name === 'Date')[0]._value);
                            cell_date.value = new Date().toDateString();
                        };
                        if (
                            users &&
                            template.details.filter(e => e._name === 'Rank column').length === 1 &&
                            template.details.filter(e => e._name === 'Name column').length === 1 &&
                            template.details.filter(e => e._name === 'User start') .length === 1 &&
                            template.details.filter(e => e._name === 'User end')   .length === 1
                        ) {
                            let line = new counter();
                            console.log(users);
                            for (let r = Number(template.details.filter(e => e._name === 'User start')[0]._value); r <= Number(template.details.filter(e => e._name === 'User end')[0]._value); r++) {
                                let rankCell = worksheet.getCell(template.details.filter(e => e._name === 'Rank column')[0]._value + r),
                                    nameCell = worksheet.getCell(template.details.filter(e => e._name === 'Name column')[0]._value + r),
                                    currentLine = line() - 1,
                                    sortedKeys = Object.keys(users).sort(),
                                    user = users[sortedKeys[currentLine]];
                                if (user) {
                                    rankCell.value = user.rank;
                                    nameCell.value = `${user.name}, ${user.ini}`;
                                } else break;
                            };
                        };
                        
                        workbook.xlsx.writeFile(`${path}/${file}`)
                        .then(() => resolve(true))
                        .catch(err => reject(err));
                    } catch (err) {
                        reject(err);
                    };
                }).catch(err => reject(err));
            } else reject(new Error('No cover sheet specified'));
        });
    };
    function write_items(file, sizes) {
        return new Promise((resolve, reject) => {
            let ex       = require('exceljs'),
                workbook = new ex.Workbook(),
                path     = `${process.env.ROOT}/public/res/`;
            workbook.xlsx.readFile(`${path}/${file}`)
            .then(() => {
                let fails = [];
                sizes.forEach(size => {
                    try {
                        let worksheet = workbook.getWorksheet(size.page),
                            cell      = worksheet.getCell(size.cell);
                        cell.value = size.qty;
                    } catch (err) {
                        fails.push({size_id: size.size_id, reason: err.message});
                    };
                });
                workbook.xlsx.writeFile(`${path}/${file}`)
                .then(() => resolve(fails))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    
    function receive_demand_line (line, receipt_id, user_id) {
        return new Promise((resolve, reject) => {
            m.demand_lines.findOne({
                where: {line_id: line.line_id},
                attributes: ['size_id', '_qty']
            })
            .then(demand_line => {
                let new_receipt_line = {
                    receipt_id: receipt_id,
                    size_id:    demand_line.size_id,
                    stock_id:   line.stock_id,
                    _qty:       demand_line._qty,
                    user_id:    user_id
                };
                if (line._serial) new_receipt_line._serial = line._serial
                receipts.createLine({line: new_receipt_line})
                .then(receipt_line_id => {
                    let actions = [];
                    actions.push(
                        m.demand_lines.update(
                            {
                                receipt_line_id: receipt_line_id,
                                _status:         3
                            },
                            {where: {line_id: line.line_id}}
                        )
                    );
                    actions.push(
                        m.order_lines.update(
                            {receipt_line_id: receipt_line_id},
                            {where: {demand_line_id: line.line_id}}
                        )
                    );
                    Promise.allSettled(actions)
                    .then(results => {
                        if (promiseResults(results)) resolve(receipt_line_id);
                        else reject(new Error(`'Receipt created: ${receipt_line_id}, some lines failed updating order and demand lines`));
                    });
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};