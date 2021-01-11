const op = require('sequelize').Op;
module.exports = (app, allowed, inc, loggedIn, m) => {
    let receipts = {}, demands = {},
        promiseResults = require('../functions/promise_results'),
        counter        = require('../functions/counter'),
        download       = require('../functions/download'),
        timestamp      = require('../functions/timestamps');
    // require('./functions/receipts')(m, receipts),
    require('./functions/demands') (m, demands),
    app.get('/stores/demands',                 loggedIn, allowed('access_demands'),                    (req, res) => res.render('stores/demands/index'));
    app.get('/stores/demands/:id',             loggedIn, allowed('access_demands'),                    (req, res) => res.render('stores/demands/show'));
    app.get('/stores/demands/:id/download',    loggedIn, allowed('access_demands'),                    (req, res) => {
        m.stores.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['_filename']
        })
        .then(demand => {
            if (demand._filename && demand._filename !== '') download(demand._filename, req, res);
            else res.error.redirect(new Error('No file found'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    app.get('/stores/get/demand',              loggedIn, allowed('access_demands',      {send: true}), (req, res) => {
        m.stores.demands.findOne({
            where: req.query,
            include: [
                inc.demand_lines(),
                inc.users(),
                inc.suppliers({as: 'supplier'})
            ]
        })
        .then(demand => {
            if (demand) res.send({success: true, demand: demand})
            else        res.send({success: false, message: 'Demand not found'});
        })
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/demands',             loggedIn, allowed('access_demands',      {send: true}), (req, res) => {
        m.stores.demands.findAll({
            where:   req.query,
            include: [
                inc.demand_lines(),
                inc.users(),
                inc.suppliers({as: 'supplier'})
            ]
        })
        .then(demands => res.send({success: true, demands: demands}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/demand_lines',        loggedIn, allowed('access_demand_lines', {send: true}), (req, res) => {
        m.stores.demand_lines.findAll({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.users(),
                inc.demands()
            ]
        })
        .then(lines => res.send({success: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/demand_line',         loggedIn, allowed('access_demand_lines', {send: true}), (req, res) => {
        m.stores.demand_lines.findOne({
            where:   req.query,
            include: [
                inc.sizes(),
                inc.users(),
                inc.demands()
            ]
        })
        .then(demand_line => res.send({success: true, demand_line: demand_line}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/demand_line_actions', loggedIn, allowed('access_demand_lines', {send: true}), (req, res) => {
        m.stores.demand_line_actions.findAll({
            where:   req.query,
            include: [
                inc.demand_lines({as: 'demand_line'}),
                inc.users()
            ]
        })
        .then(demand_line_actions => res.send({success: true, demand_line_actions: demand_line_actions}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/demands',                loggedIn, allowed('demand_add',          {send: true}), (req, res) => {
        demands.create({
            demand: {
                supplier_id: req.body.supplier_id,
                user_id: req.user.user_id
            }
        })
        .then(result => {
            let message = 'Demand raised: ';
            if (!result.created) message = 'There is already a demand open for this supplier: ';
            res.send({success: true, message: message + result.demand_id});
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/demand_lines',           loggedIn, allowed('demand_line_add',     {send: true}), (req, res) => {
        demands.createLine({
            line: req.body.line,
            user_id: req.user.user_id
        })
        .then(result => res.send({success: true, message: `Item added: ${result.line_id}`}))
        .catch(err => res.error.send(err, res))
    });

    app.put('/stores/demands/:id',             loggedIn, allowed('demand_edit',         {send: true}), (req, res) => {
        m.stores.demands.findOne({
            where: {demand_id: req.params.id},
            include: [inc.suppliers({as: 'supplier', file: true})],
            attributes: ['demand_id', '_status']
        })
        .then(demand => {
            if (Number(req.body._status) === 2) {
                if (demand._status !== 1) res.send_error('Only draft demands can be completed', res)
                else {
                    let actions = [];
                    actions.push(demand.update({_status: 2}));
                    actions.push(
                        m.stores.demand_lines.update(
                            {_status: 2},
                            {where: {
                                demand_id: demand.demand_id,
                                _status:   1
                            }}
                        )
                    );
                    actions.push(
                        m.stores.notes.create({
                            _table:  'demands',
                            _id:     demand.demand_id,
                            _note:   'Completed',
                            user_id: req.user.user_id,
                            _system:  1
                        })
                    );
                    return Promise.allSettled(actions)
                    .then(result => {
                        if (demand.supplier.file) {
                            return raise_demand(demand.demand_id, req.user.user_id)
                            .then(raise_result => {
                                if (raise_result.success) {
                                    demand.update({_filename: raise_result.file})
                                    .then(update_result => res.send({success: true, message: `Demand completed, filename: ${raise_result.file}`}))
                                    .catch(err => res.error.send(err, res));
                                } else res.error.send(raise_result.message, res);
                            })
                            .catch(err => res.error.send(err, res));
                        } else res.send({success: true, message: 'Demand completed'});
                    })
                    .catch(err => res.error.send(err, res));
                };
            } else if (Number(req.body._status) === 3) {
                if (demand._status !== 2) res.send_error('Only complete demands can be completed', res)
                else {
                    m.stores.demand_lines.findAll({
                        where: {
                            demand_id: demand.demand_id,
                            _status: {[op.or]: [1, 2]}
                        }
                    })
                    .then(lines => {
                        if (lines) res.send_error(`There are ${lines.length} open or pending lines on this demand. Demands cannot be closed until all lines are complete`, res)
                        else {
                            let actions = [];
                            actions.push(demand.update({_status: 3}));
                            actions.push(
                                m.stores.demand_lines.update(
                                    {_status: 3},
                                    {where: {
                                        demand_id: demand.demand_id,
                                        _status:   2
                                    }}
                                )
                            );
                            actions.push(
                                m.stores.notes.create({
                                    _table:  'demands',
                                    _id:     demand.demand_id,
                                    _note:   'Closed',
                                    user_id: req.user.user_id,
                                    _system:  1
                                })
                            );
                            Promise.allSettled(actions)
                            .then(result => res.send({success: true, message: 'Demand Closed'}))
                            .catch(err => res.error.send(err, res));
                        };
                    })
                };
            } else res.send_error('Invalid status', res);
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/demand_lines/:id',        loggedIn, allowed('receipt_add',         {send: true}), (req, res) => {
        m.stores.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['demand_id', 'supplier_id']
        })
        .then(demand => {
            let actions = [], receives = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                if      (line._status === '3') receives.push(line);
                else if (line._status === '0') {
                    actions.push(
                        m.stores.demand_lines.update(
                            {_status: 0},
                            {where: {line_id: line.line_id}}
                        )
                    );
                    actions.push(
                        new Promise((resolve, reject) => {
                            m.stores.order_line_actions.findAll({
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
                        m.stores.demand_line_actions.create({
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
    
    app.delete('/stores/demands/:id',          loggedIn, allowed('demand_delete',       {send: true}), (req, res) => {
        m.stores.demand_lines.destroy({where: {demand_id: req.params.id}})
        .then(result => {
            m.stores.demands.destroy({where: {demand_id: req.params.id}})
            .then(result => res.send({success: true, message: 'Demand deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/demand_lines/:id',     loggedIn, allowed('demand_line_delete',  {send: true}), (req, res) => {
        m.stores.demand_lines.findOne({where: {line_id: req.params.id}})
        .then(line => {
            line.update({_status: 0})
            .then(result => {
                m.stores.notes.create({
                    _table:  'demands',
                    _note:   `Line ${req.params.id} cancelled`,
                    _id:     line.demand_id,
                    user_id: req.user.user_id,
                    system:  1
                })
                .then(result => res.send({success: true, message: 'Line cancelled'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });

    function raise_demand(demand_id, user_id) {
        return new Promise((resolve, reject) => {
            return m.stores.demands.findOne({
                where: {demand_id: demand_id},
                include: [
                    inc.demand_lines({
                        where: {_status: 2},
                        sizes: true
                    }),
                    inc.suppliers({
                        as: 'supplier',
                        file: true,
                        account: true
                    })
                ],
                attributes: ['demand_id', '_filename', 'supplier_id']
            })
            .then(demand => {
                if (demand._filename && demand._filename !== '') {       //check the demand is not already raised
                    resolve({
                        success: false,
                        message: 'Demand has already been raised'
                    });
                } else if (!demand.lines || demand.lines.length === 0) { //check demand has open lines
                    resolve({
                        success: false,
                        message: 'No open lines for this demand'
                    });
                } else if (!demand.supplier.file) {                      //check template file exists
                    resolve({
                        success: false,
                        message: 'No demand file for this supplier'
                    });
                } else if (!demand.supplier.account) {                   //check account exists
                    resolve({
                        success: false,
                        message: 'No account for this supplier'
                    });
                } else {
                    return correlate_sizes(demand.lines, demand.supplier_id)
                    .then(correlate_results => {
                        if (correlate_results.success) {
                            return createDemandFile(demand.supplier.file._path, demand.demand_id)
                            .then(create_file_result => {
                                if (create_file_result.success) {
                                    return writeCoverSheet(create_file_result.file, demand.supplier, correlate_results.users)
                                    .then(cover_sheet_result => {
                                        return writeItems(create_file_result.file, correlate_results.items)
                                        .then(items_result => {
                                            return m.stores.notes.create({
                                                _id: demand_id,
                                                _table: 'demands',
                                                _note: 'Demand file created',
                                                _system: 1,
                                                user_id: user_id
                                            })
                                            .then(note => {
                                                resolve({
                                                    success: true,
                                                    message: 'Demand file created',
                                                    file: create_file_result.file
                                                });
                                            })
                                            .catch(err => reject(err));
                                        })
                                        .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err))
                                } else resolve(create_file_result);
                            })
                            .catch(err => reject(err));
                        } else resolve(correlate_results);
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => reject(err));
        });
    };
    function correlate_sizes(lines, supplier_id) {
        return new Promise((resolve, reject) => {
            let items = [], users = [], orders = [], order_actions = [], rejects = [];
            lines.forEach(line => {
                if (
                    !line.size._demand_page                      &&
                    String(line.size._demand_page).trim() === '' &&
                    !line.size._demand_cell                      &&
                    String(line.size._demand_cell).trim() === ''
                ) {                                                 //Reject if no demand details
                    rejects.push({
                        line_id: line.line_id,
                        reason:  'No demand details'
                    });
                } else if (supplier_id !== line.size.supplier_id) { //Reject if wrong supplier
                    rejects.push({
                        line_id: line.line_id,
                        reason:  'Size not for this supplier'
                    });
                } else {
                    order_actions.push(
                        m.stores.order_line_actions.findAll({
                            where: {
                                _action: 'Demand',
                                action_line_id: line.line_id
                            },
                            include: [inc.order_lines({orders: true, as: 'order_line'})],
                            attributes: ['order_line_id']
                        })
                    );
                    let itemIndex = items.findIndex(e => e.size_id === line.size_id)
                    if (itemIndex === -1) {
                        items.push({
                            size_id: line.size_id,
                            qty:     line._qty,
                            page:    line.size._demand_page,
                            cell:    line.size._demand_cell
                        })
                    } else {
                        items[itemIndex].qty += line._qty;
                    };
                };
            });
            if (items.length === 0) {                               //Reject if no valid items
                resolve({
                    success: false,
                    message: 'No valid items'
                });
            } else {
                return Promise.allSettled(order_actions)
                .then(order_results => {
                    order_results.forEach(order_action => {
                        if (order_action.status === 'fulfilled') {
                            order_action.value.forEach(action => {
                                if (action.order_line.order.user_id_order !== -1) {
                                    if (users.findIndex(e => e.id === action.order_line.order.user_id_order) === -1) {
                                        orders.push({line_id: action.order_line.order_line_id})
                                        users.push({
                                            id: action.order_line.order.user_id_order,
                                            rank: action.order_line.order.user_order.rank._rank,
                                            name: action.order_line.order.user_order._name
                                        });
                                    };
                                };
                            });
                        };
                    });
                    resolve({
                        success: true,
                        rejects: rejects,
                        orders:  orders,
                        users:   users,
                        items:   items
                    });
                })
                .catch(err => reject(err));
            };
        });
    };
    function createDemandFile (file, demand_id) { //create new demand file
        return new Promise((resolve, reject) => {
            let fs = require('fs');
            if (file) {
                let path       = `${process.env.ROOT}/public/res/`,
                    newDemand  = `demands/${timestamp()}_demand-${demand_id}.xlsx`,
                    demandFile = `${path}files/${file}`;
                    console.log(path, newDemand, demandFile);
                fs.copyFile(demandFile, path + newDemand, err => {
                    if (!err) resolve({
                        success: true,
                        file: newDemand
                    })
                    else {
                        console.log(err);
                        resolve({
                            success: false,
                            message: `Unable to create demand file: ${err.message}`
                        })
                    };
                });
            } else {
                resolve({
                    success: false,
                    message: `No demand file specified`
                });
            };
        });
    };
    function writeCoverSheet (demandFile, supplier, users) {
        return new Promise((resolve, reject) => {
            let ex       = require('exceljs'),
                workbook = new ex.Workbook(),
                path     = `${process.env.ROOT}/public/res/`;
            workbook.xlsx.readFile(path + demandFile)
            .then(() => {
                try {
                    let worksheet = workbook.getWorksheet(supplier.file._cover_sheet);

                    let cell_code = worksheet.getCell(supplier.file['_code']);
                    cell_code.value = supplier.account._number;

                    let cell_rank = worksheet.getCell(supplier.file['_rank']);
                    cell_rank.value = supplier.account.user.rank._rank;

                    let cell_name = worksheet.getCell(supplier.file['_name']);
                    cell_name.value = supplier.account.user._name;

                    let cell_sqn = worksheet.getCell(supplier.file['_sqn']);
                    cell_sqn.value = supplier.account._name;

                    let cell_date = worksheet.getCell(supplier.file._date),
                        now       = new Date(),
                        line      = counter();
                    cell_date.value = now.toDateString();

                    if (users) {
                        for (let r = Number(supplier.file._request_start); r <= Number(supplier.file._request_end); r++) {
                            let rankCell = worksheet.getCell(supplier.file._rank_column + r),
                                nameCell = worksheet.getCell(supplier.file._name_column + r),
                                currentLine = line() - 1,
                                sortedKeys = Object.keys(users).sort(),
                                user = users[sortedKeys[currentLine]];
                            if (user) {
                                rankCell.value = user.rank;
                                nameCell.value = user.name;
                            } else break;
                        };
                    };
                    
                    workbook.xlsx.writeFile(path + demandFile)
                    .then(() => resolve({success: true}))
                    .catch(err => reject(err));
                } catch (err) {
                    reject(err);
                };
            }).catch(err => reject(err));
        });
    };
    function writeItems (demandFile, items) {
        return new Promise((resolve, reject) => {
            let ex = require('exceljs'),
                workbook = new ex.Workbook(),
                path = `${process.env.ROOT}/public/res/`;
            workbook.xlsx.readFile(path + demandFile)
            .then(() => {
                let success = [], fails = [];
                items.forEach(item => {
                    try {
                        let worksheet = workbook.getWorksheet(item.page),
                            cell      = worksheet.getCell(item.cell);
                        cell.value = item.qty;
                        success.push({
                            size_id: item.size_id,
                            qty:     item.qty
                        });
                    } catch (err) {
                        fails.push({size_id: item.size_id, reason: err.message});
                    };
                });
                workbook.xlsx.writeFile(path + demandFile)
                .then(() => resolve({success: success, fails: fails}))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    
    function receive_demand_line (line, receipt_id, user_id) {
        return new Promise((resolve, reject) => {
            m.stores.demand_lines.findOne({
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
                        m.stores.demand_lines.update(
                            {
                                receipt_line_id: receipt_line_id,
                                _status:         3
                            },
                            {where: {line_id: line.line_id}}
                        )
                    );
                    actions.push(
                        m.stores.order_lines.update(
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