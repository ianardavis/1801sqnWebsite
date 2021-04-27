module.exports = (app, m, pm, op, inc, li, send_error) => {
    let fn = {};
    require(`${process.env.FUNCS}/download`)(fn);
    require(`${process.env.FUNCS}/counter`)(fn);
    require(`${process.env.FUNCS}/demands`)(m, fn);
    require(`${process.env.FUNCS}/promise_results`)(fn);
    app.get('/demands',              li, pm.get('access_demands'),        (req, res) => res.render('stores/demands/index'));
    app.get('/demands/:id',          li, pm.get('access_demands'),        (req, res) => res.render('stores/demands/show'));
    app.get('/demands/:id/download', li, pm.check('access_demands'),      (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['filename']
        })
        .then(demand => {
            if      (!demand)          send_error(res, 'Demand not found')
            else if (!demand.filename) send_error(res, '')
            else download(demand.filename, req, res);
        })
        .catch(err => send_error(res, err));
    });

    app.get('/count/demands',        li, pm.check('access_demands'),      (req, res) => {
        m.demands.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });
    app.get('/count/demand_lines',   li, pm.check('access_demand_lines'), (req, res) => {
        m.demand_lines.count({where: req.query})
        .then(count => res.send({success: true, result: count}))
        .catch(err => send_error(res, err));
    });
    
    app.get('/get/demand',           li, pm.check('access_demands'),      (req, res) => {
        m.demands.findOne({
            where: req.query,
            include: [
                // inc.demand_lines(),
                inc.user(),
                inc.supplier()
            ]
        })
        .then(demand => {
            if (demand) res.send({success: true, result: demand})
            else send_error(res, 'Demand not found');
        })
        .catch(err => send_error(res, err));
    });
    app.get('/get/demands',          li, pm.check('access_demands'),      (req, res) => {
        m.demands.findAll({
            where:   req.query,
            include: [
                // inc.demand_lines(),
                inc.user(),
                inc.supplier()
            ]
        })
        .then(demands => res.send({success: true, result: demands}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/demand_lines',     li, pm.check('access_demand_lines'), (req, res) => {
        m.demand_lines.findAll({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.demand()
            ]
        })
        .then(lines => res.send({success: true, result: lines}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/demand_line',      li, pm.check('access_demand_lines'), (req, res) => {
        m.demand_lines.findOne({
            where:   req.query,
            include: [
                inc.size(),
                inc.user(),
                inc.demand(),
                inc.actions({include: [inc.orders()]})
            ]
        })
        .then(demand_line => res.send({success: true, result: demand_line}))
        .catch(err => send_error(res, err));
    });

    app.post('/sizes/:id/demand',    li, pm.check('issue_add'),           (req, res) => {
        if (req.body.lines) {
            let actions = [];
            req.body.lines.forEach(line => {
                actions.push(
                    fn.demands.lines.create({
                        demand_id: req.body.demand_id,
                        user_id:   req.user.user_id,
                        size_id:   line.size_id,
                        op_or:     op.or,
                        qty:       line.qty
                    })
                );
            });
            Promise.all(actions)
            .then(result => res.send({success: true, message: 'Line(s) created'}))
            .catch(err => send_error(res, err));
        } else send_error(res, 'No lines');
    });
    app.post('/demands',             li, pm.check('demand_add'),          (req, res) => {
        fn.demands.create({
            supplier_id: req.body.supplier_id,
            user_id:     req.user.user_id
        })
        .then(demand => res.send({success: true, message: (demand.created ? 'There is already a demand open for this supplier' : 'Demand raised')}))
        .catch(err => send_error(res, err));
    });

    app.put('/demands/raise/:id',    li, pm.check('demand_edit'),         (req, res) => {
        raise_demand(req.params.id, req.user.user_id)
        .then(result => res.send(result))
        .catch(err => send_error(res, err));
    });
    app.put('/demands/:id',          li, pm.check('demand_edit'),         (req, res) => {
        if (Number(req.body.status) === 2) {
            complete_demand(req.params.id, req.user.user_id)
            .then(filename => res.send({success: true,  message: `Demand completed. Filename: ${filename}`}))
            .catch(err => send_error(res, err));
        } else if (Number(req.body._status) === 3) {
            close_demand(req.params.id, req.user.user_id)
            .then(result =>   res.send({success: true,  message: 'Demand closed'}))
            .catch(err => send_error(res, err));
        } else send_error(res, 'Invalid request');
    });
    app.put('/demand_lines/:id',     li, pm.check('receipt_add'),         (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['demand_id', 'supplier_id']
        })
        .then(demand => {
            let actions = [], receives = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                if      (line.status === '3') receives.push(line);
                else if (line.status === '0') {
                    actions.push(
                        m.demand_lines.update(
                            {status: 0},
                            {where: {line_id: line.line_id}}
                        )
                    );
                    actions.push(
                        new Promise((resolve, reject) => {
                            m.order_line_actions.findAll({
                                where: {
                                    action: 'Demand',
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
                                                {status: 2},
                                                {where: {
                                                    line_id: e.order_line_id,
                                                    status: 3
                                                }}
                                            )
                                        );
                                        order_actions.push(
                                            m.order_line_actions.create({
                                                order_line_id:  e.order_line_id,
                                                action_line_id: line.line_id,
                                                action:        'Demand line cancelled',
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
                            action:         `Cancelled`,
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
                else send_error(res, 'Some actions failed');
            })
            .catch(err => send_error(res, err));
        })
        .catch(err => send_error(res, err));
    });
    
    app.delete('/demands/:id',       li, pm.check('demand_delete'),       (req, res) => {
        m.demands.findOne({
            where:      {demand_id: req.params.id},
            include:    [inc.demand_lines({where: {status: {[op.not]: 0}}})],
            attributes: ['demand_id', 'status']
        })
        .then(demand => {
            if      (!demand)                                 send_error(res, 'Demand not found')
            else if (demand.status === 0)                     send_error(res, 'This demand is already cancelled')
            else if (demand.lines && demand.lines.length > 0) send_error(res, 'Can not cancel a demand with it has pending, open or received lines')
            else {
                demand.update({status: 0})
                .then(result => {
                    if (!result) send_error(res, `Error updating demand: ${err.message}`)
                    else {
                        m.notes.create({
                            id: demand.demand_id,
                            _table: 'demands',
                            note: 'Cancelled',
                            system: 1,
                            user_id: req.user.user_id
                        })
                        .then(note => res.send({success: true,  message: 'Demand Cancelled'}))
                        .catch(err => {
                            console.log(err);
                            res.send({success: true, message: `Demand cancelled. Error updating demand: ${err.message}`})
                        });
                    };
                })
                .catch(err => send_error(res, err))
            };
        })
        .catch(err => send_error(res, err));
    });
    app.delete('/demand_lines/:id',  li, pm.check('demand_line_delete'),  (req, res) => {
        m.demand_lines.findOne({
            where: {line_id: req.params.id},
            attributes: ['line_id', 'status']
        })
        .then(line => {
            if      (line.status === 0) res.send({succes: false, message: 'This line has already been cancelled'})
            else if (line.status === 3) res.send({succes: false, message: 'This line has already been received'})
            else {
                line.update({status: 0})
                .then(result => {
                    if (!result) send_error(res, 'Line not updated')
                    else {
                        m.notes.create({
                            _table:  'demand_lines',
                            note:   `Line ${req.params.id} cancelled`,
                            id:     line.line_id,
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

    function complete_demand(demand_id, user_id) {
        return new Promise((resolve, reject) => {
            m.demands.findOne({
                where:      {demand_id: demand_id},
                include:    [inc.demand_lines({where: {status: 1}})],
                attributes: ['demand_id', 'status']
            })
            .then(demand => {
                if      (!demand)                                    reject(new Error('Demand not found'))
                else if (demand.status !== 1)                        reject(new Error('This demand is not in draft'))
                else if (!demand.lines || demand.lines.length === 0) reject(new Error('No pending lines for this demand'))
                else {
                    return demand.update({_status: 2})
                    .then(result => {
                        if (!result) reject(new Error('demand not updated'))
                        else {
                            return m.demand_lines.update(
                                {status: 2},
                                {where: {
                                    demand_id: demand.demand_id,
                                    status: 1
                                }
                            })
                            .then(result => {
                                if (!result) reject(new Error('Lines not updated'))
                                else {
                                    return m.notes.create({
                                        _table:  'demands',
                                        id:      demand.demand_id,
                                        note:    'Completed',
                                        system:  1,
                                        user_id: user_id
                                    })
                                    .then(note => {
                                        return raise_demand(demand.demand_id, user_id)
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
                include: [inc.demand_lines({where: {status: {[op.or]: [1, 2]}}})],
                attributes: ['demand_id', 'status']
            })
            .then(demand => {
                if      (!demand)                                 reject(new Error('Demand not found'))
                else if (demand.status !== 2)                     reject(new Error('This demand is not complete'))
                else if (demand.lines && demand.lines.length > 0) reject(new Error('This demand has pending or open lines'))
                else {
                    return demand.update({status: 3})
                    .then(result => {
                        if (!result) reject(new Error('Demand not updated'))
                        else {
                            return m.notes.create({
                                _table:  'demands',
                                id:     demand.demand_id,
                                note:   'Closed',
                                user_id: user_id,
                                system:  1
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
                attributes: ['demand_id', 'status', 'filename', 'supplier_id']
            })
            .then(demand => {
                if      (!demand)                                   reject(new Error('Demand not found'))
                if      (demand.status !== 2)                       reject(new Error('This demand is not complete'))
                else if (demand.filename && demand.filename !== '') reject(new Error('This demand has already been raised'))
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
                        attributes: ['file_id', 'filename'],
                        where:      {description: 'Demand'}
                    }),
                    inc.account()
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
                    status: 2
                },
                include:    [inc.sizes({
                    attributes: ['size_id', 'supplier_id'],
                    include:    [inc.details()]
                })],
                attributes: ['line_id', 'size_id', 'qty', 'status']
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
                    line.size.details.findIndex(e => e.name === 'Demand Page') !== -1 &&
                    line.size.details.findIndex(e => e.name === 'Demand Cell') !== -1
                ) {
                    let demand_page = line.size.details[line.size.details.findIndex(e => e.name === 'Demand Page')]._value,
                        demand_cell = line.size.details[line.size.details.findIndex(e => e.name === 'Demand Cell')]._value;
                    if (
                        demand_page !== '' &&
                        demand_cell !== ''
                    ) {
                        let sizeIndex = sizes.findIndex(e => e.size_id === line.size_id);
                        if (sizeIndex === -1) {
                            sizes.push({
                                size_id: line.size_id,
                                qty:     line.qty,
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
                                name:    user.surname,
                                rank:    user.rank.rank,
                                ini:     user.first_name
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
                fs.copyFile(`${path}/files/${file.filename}`, `${path}/${new_file}`, COPYFILE_EXCL, function (err) {
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
            if (template.details.filter(e => e.name === 'Cover sheet').length === 1) {
                let ex       = require('exceljs'),
                    workbook = new ex.Workbook(),
                    path     = `${process.env.ROOT}/public/res/`;
                workbook.xlsx.readFile(`${path}/${file}`)
                .then(() => {
                    try {
                        let worksheet = workbook.getWorksheet(template._cover_sheet);
                        if (template.details.filter(e => e.name === 'Code').length === 1) {
                            let cell_code = worksheet.getCell(template.details.filter(e => e.name === 'Code')[0]._value);
                            cell_code.value = account._number;
                        };

                        if (template.details.filter(e => e.name === 'Rank').length === 1) {
                            let cell_rank = worksheet.getCell(template.details.filter(e => e.name === 'Rank')[0]._value);
                            cell_rank.value = account.user.rank._rank;
                        };

                        if (template.details.filter(e => e.name === 'Holder').length === 1) {
                            let cell_name = worksheet.getCell(template.details.filter(e => e.name === 'Holder')[0]._value);
                            cell_name.value = account.user.name;
                        };

                        if (template.details.filter(e => e.name === 'Squadron').length === 1) {
                            let cell_sqn = worksheet.getCell(template.details.filter(e => e.name === 'Squadron')[0]._value);
                            cell_sqn.value = account.name;
                        };

                        if (template.details.filter(e => e.name === 'Date').length === 1) {
                            let cell_date = worksheet.getCell(template.details.filter(e => e.name === 'Date')[0]._value);
                            cell_date.value = new Date().toDateString();
                        };
                        if (
                            users &&
                            template.details.filter(e => e.name === 'Rank column').length === 1 &&
                            template.details.filter(e => e.name === 'Name column').length === 1 &&
                            template.details.filter(e => e.name === 'User start') .length === 1 &&
                            template.details.filter(e => e.name === 'User end')   .length === 1
                        ) {
                            let line = new counter();
                            console.log(users);
                            for (let r = Number(template.details.filter(e => e.name === 'User start')[0]._value); r <= Number(template.details.filter(e => e.name === 'User end')[0].value); r++) {
                                let rankCell = worksheet.getCell(template.details.filter(e => e.name === 'Rank column')[0]._value + r),
                                    nameCell = worksheet.getCell(template.details.filter(e => e.name === 'Name column')[0]._value + r),
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
                attributes: ['size_id', 'qty']
            })
            .then(demand_line => {
                let new_receipt_line = {
                    receipt_id: receipt_id,
                    size_id:    demand_line.size_id,
                    stock_id:   line.stock_id,
                    qty:        demand_line._qty,
                    user_id:    user_id
                };
                if (line.serial) new_receipt_line.serial = line.serial
                receipts.createLine({line: new_receipt_line})
                .then(receipt_line_id => {
                    let actions = [];
                    actions.push(
                        m.demand_lines.update(
                            {
                                receipt_line_id: receipt_line_id,
                                status:         3
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
                    return Promise.allSettled(actions)
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