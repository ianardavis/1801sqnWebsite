const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let db        = require(process.env.ROOT + '/fn/db'),
        demands   = require(process.env.ROOT + '/fn/demands'),
        receipts  = require(process.env.ROOT + '/fn/receipts'),
        utils     = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/demands',              isLoggedIn, allowed('access_demands'),                    (req, res) => {
        m.suppliers.findAll()
        .then(suppliers => res.render('stores/demands/index', {suppliers: suppliers}))
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/demands/:id',          isLoggedIn, allowed('access_demands'),                    (req, res) => {
        db.findOne({
            table: m.demands,
            where: {demand_id: req.params.id},
            include: [
                inc.users(),
                m.suppliers
        ]})
        .then(demand => {
            res.render('stores/demands/show', {
                demand: demand,
                notes:  {table: 'demands', id: demand.demand_id},
                show_tab: req.query.tab || 'details'
            });
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    app.get('/stores/demands/:id/download', isLoggedIn, allowed('access_demands'),                    (req, res) => {
        db.findOne({
            table: m.demands,
            where: {demand_id: req.params.id}
        })
        .then(demand => {
            if (demand._filename && demand._filename !== '') utils.download(demand._filename, req, res);
            else res.error.redirect(new Error('No file found'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });
    
    app.get('/stores/get/demands',          isLoggedIn, allowed('access_demands',      {send: true}), (req, res) => {
        m.demands.findAll({
            where: req.query,
            include: [
                inc.demand_lines(),
                inc.users(),
                inc.suppliers({as: 'supplier'})
        ]})
        .then(demands => res.send({result: true, demands: demands}))
        .catch(err => res.error.send(err, res));
    });
    app.get('/stores/get/demandlines',      isLoggedIn, allowed('access_demand_lines', {send: true}), (req, res) => {
        m.demand_lines.findAll({
            where: req.query,
            include: [
                inc.sizes({stock: true}),
                inc.receipt_lines({as: 'receipt_line', receipts: true})
        ]})
        .then(lines => res.send({result: true, lines: lines}))
        .catch(err => res.error.send(err, res));
    });

    app.post('/stores/demands',             isLoggedIn, allowed('demand_add',          {send: true}), (req, res) => {
        demands.create({
            m: {suppliers: m.suppliers, demands: m.demands},
            demand: {
                supplier_id: req.body.supplier_id,
                user_id: req.user.user_id
            }
        })
        .then(result => {
            let message = 'Demand raised: ';
            if (!result.created) message = 'There is already a demand open for this supplier: ';
            res.send({result: true, message: message + result.demand_id});
        })
        .catch(err => res.error.send(err, res));
    });
    app.post('/stores/demand_lines/:id',    isLoggedIn, allowed('demand_line_add',     {send: true}), (req, res) => {
        req.body.line.demand_id = req.params.id;
        req.body.line.user_id   = req.user.user_id;
        demands.createLine({
            m: {sizes: m.sizes, demands: m.demands, demand_lines: m.demand_lines},
            line: req.body.line
        })
        .then(message => res.send({result: true, message: 'Item added: ' + message}))
        .catch(err => res.error.send(err, res))
    });

    app.put('/stores/demands/:id',          isLoggedIn, allowed('demand_edit',         {send: true}), (req, res) => {
        db.findOne({
            table: m.demands,
            where: {demand_id: req.params.id},
            include: [
                inc.suppliers({as: 'supplier', file: true})
        ]})
        .then(demand => {
            if (demand._complete) res.send_error('This demand is already complete', res);
            else {
                let actions = [];
                actions.push(
                    m.demands.update(
                        {_complete: 1},
                        {where: {demand_id: demand.demand_id}}
                    )
                );
                actions.push(
                    m.demand_lines.update(
                        {_status: 'Open'},
                        {where: {
                            demand_id: demand.demand_id,
                            _status:   'Pending'
                        }}
                    )
                );
                Promise.allSettled(actions)
                .then(result => {
                    m.notes.create({
                        _table:  'demands',
                        _id:     demand.demand_id,
                        _note:   'Completed',
                        user_id: req.user.user_id,
                        system:  1
                    })
                    .then(result => {
                        if (demand.supplier.file) {
                            raiseDemandFile(demand.demand_id, req.user.user_id)
                            .then(filename => res.send({result: true, message: 'Demand completed, filename: ' + filename}))
                            .catch(err => res.error.send(err, res));
                        } else res.send({result: true, message: 'Demand completed'});
                    })
                    .catch(err => res.error.send(err, res));
                })
                .catch(err => res.error.send(err, res));
            };
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/demand_lines/:id',     isLoggedIn, allowed('receipt_add',         {send: true}), (req, res) => {
        db.findOne({
            table: m.demands,
            where: {demand_id: req.params.id}
        })
        .then(demand => {
            let actions = [], receives = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                line.line_id = Number(String(lineID).replace('line_id', ''));
                if (line._status === 'Receive') {
                    receives.push(line);
                } else if (line._status === 'Cancel') {
                    actions.push(
                        m.demand_lines.update(
                            {_status: 'Cancelled'},
                            {where: {line_id: line.line_id}}
                        )
                    );
                    actions.push(
                        m.order_lines.update(
                            {demand_line_id: null},
                            {where: {demand_line_id: line.line_id}}
                        )
                    );
                    actions.push(
                        m.notes.create({
                            _id:     demand.demand_id,
                            _table:  'demands',
                            _note:   'Line ' + line.line_id + ' cancelled',
                            user_id: req.user.user_id,
                            system:  1
                        })
                    );
                };
            };
            Promise.allSettled(actions)
            .then(cancel_results => {
                if (receives.length > 0) {
                    actions = [];
                    receipts.create({
                        m: {receipts: m.receipts},
                        receipt: {
                            supplier_id: demand.supplier_id,
                            user_id:     req.user.user_id
                        }
                    })
                    .then(result => {
                        receives.forEach(line => {
                            actions.push(
                                receive_demand_line(
                                    line,
                                    result.receipt_id,
                                    req.user.user_id
                                )
                            );
                        });
                        Promise.allSettled(actions)
                        .then(receive_results => {
                            if (utils.promiseResults(cancel_results.concat(receive_results))) {
                                res.send({result: true, message: 'Lines actioned'}); /////////////////
                            } else {
                                res.error.send('Some actions failed', res); ////////////////
                            };
                        })
                        .catch(err => res.error.send(err, res));
                        
                    })
                    .catch(err => res.error.send(err, res));
                } else if (utils.promiseResults(cancel_results)) {
                    res.send({result: true, message: 'Lines actioned'}); ///////////////////////
                } else {
                    res.error.send('Some actions failed', res); ////////////////
                };
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    
    app.delete('/stores/demands/:id',       isLoggedIn, allowed('demand_delete',       {send: true}), (req, res) => {
        db.destroy({
            table: m.demand_lines,
            where: {demand_id: req.params.id}
        })
        .then(result => {
            db.destroy({
                table: m.demands,
                where: {demand_id: req.params.id}
            })
            .then(result => res.send({result: true, message: 'Demand deleted'}))
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    app.delete('/stores/demand_lines/:id',  isLoggedIn, allowed('demand_line_delete',  {send: true}), (req, res) => {
        db.findOne({
            table: m.demand_lines,
            where: {line_id: req.params.id}
        })
        .then(line => {
            db.update({
                table: m.demand_lines,
                where: {line_id: req.params.id},
                record: {_status: 'Cancelled'}
            })
            .then(result => {
                m.notes.create({
                    _table:   'demands',
                    _note:    'Line ' + req.params.id + ' cancelled',
                    _id:      line.demand_id,
                    user_id: req.user.user_id,
                    system:  1
                })
                .then(result => res.send({result: true, message: 'Line cancelled'}))
                .catch(err => res.error.send(err, res));
            })
            .catch(err => res.error.send(err, res));
        })
        .catch(err => res.error.send(err, res));
    });
    
    function raiseDemandFile (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            db.findOne({
                table: m.demands,
                where: {demand_id: demand_id},
                include: [
                    inc.suppliers({
                        as: 'supplier',
                        file: true,
                        account: true}),
                    inc.demand_lines({
                        where: {_status: 'Open'},
                        include: [
                            inc.sizes(),
                            inc.order_lines({
                                as: 'order_lines',
                                orders: true})
            ]})]})
            .then(demand => {
                let items = [], users = [], rejects = false;
                demand.lines.forEach(line => {
                    if (line.size._demand_page && line.size._demand_cell) {
                        if (line.order_lines) {
                            line.order_lines.forEach(order_line => {
                                if (users.findIndex(e => e.id === order_line.order.ordered_for) === -1) {
                                    users.push({
                                        id: order_line.order.ordered_for,
                                        rank: order_line.order._for.rank._rank,
                                        name: order_line.order._for._name
                                    });
                                };
                            });
                        };
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
                    } else rejects = true;
                });
                createDemandFile(demand.supplier.file, demand.demand_id)
                .then(demandFile => {
                    writeItems(demandFile, items)
                    .then(writeItemsResult => {
                        if (writeItemsResult.success.length > 0) {
                            writeCoverSheet(
                                demandFile,
                                demand.supplier,
                                users
                            )
                            .then(results2 => {
                                db.update({
                                    table: m.demands,
                                    where: {demand_id: demand_id},
                                    record: {_filename: demandFile}
                                })
                                .then(result => {
                                    m.notes.create({
                                        _table: 'demands',
                                        _id: demand_id,
                                        _note: 'File created',
                                        user_id: user_id,
                                        system: 1
                                    })
                                    .then(result => resolve({fails: writeItemsResult.fails, filename: demandFile}))
                                    .catch(err => reject(err));
                                })
                                .catch(err => reject(err));
                            })
                            .catch(err => reject(err));
                        } else reject(new Error('No items written to demand'));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function createDemandFile (file, demand_id) {
        return new Promise((resolve, reject) => {
            let fs = require('fs');
            if (file._path) {
                let path = process.env.ROOT + '/public/res/',
                    newDemand = 'demands/' + utils.timestamp() + ' demand - ' + demand_id + '.xlsx',
                    demandFile = path + 'files/' + file._path;
                fs.copyFile(demandFile, path + newDemand, err => {
                    if (!err) resolve(newDemand)
                    else reject(err);
                });
            } else reject(new Error('No demand file specified'));
        });
    };
    function writeCoverSheet (demandFile, supplier, users) {
        return new Promise((resolve, reject) => {
            let ex = require('exceljs'),
                workbook = new ex.Workbook(),
                path     = process.env.ROOT + '/public/res/';
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

                    let cell = worksheet.getCell(supplier.file._date),
                        now = new Date(),
                        line = utils.counter();
                    cell.value = now.toDateString();

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
                    .then(() => resolve(true))
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
                path = process.env.ROOT + '/public/res/';
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
            db.findOne({
                table: m.demand_lines,
                where: {line_id: line.line_id}
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
                receipts.createLine({
                    m: {
                        receipt_lines: m.receipt_lines,
                        receipts:      m.receipts,
                        serials:       m.serials,
                        sizes:         m.sizes,
                        stock:         m.stock
                    },
                    line: new_receipt_line
                })
                .then(receipt_line_id => {
                    let actions = [];
                    actions.push(
                        db.update({
                            table: m.demand_lines,
                            where: {line_id: line.line_id},
                            record: {
                                receipt_line_id: receipt_line_id,
                                _status:         'Received'
                            }
                        })
                    );
                    actions.push(
                        db.update({
                            table: m.order_lines,
                            where: {demand_line_id: line.line_id},
                            record: {receipt_line_id: receipt_line_id}
                        })
                    );
                    Promise.allSettled(actions)
                    .then(results => {
                        if (utils.promiseResults(results)) {
                            resolve(receipt_line_id);
                        } else {
                            reject(new Error('Receipt created: ' + receipt_line_id + ', some lines failed updating order and demand lines'));
                        }
                    });
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
};