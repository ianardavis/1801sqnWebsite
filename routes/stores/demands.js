const op = require('sequelize').Op;
module.exports = (app, allowed, inc, isLoggedIn, m) => {
    let demands  = require(process.env.ROOT + '/fn/demands'),
        receipts = require(process.env.ROOT + '/fn/receipts'),
        utils    = require(process.env.ROOT + '/fn/utils');
    app.get('/stores/demands',              isLoggedIn, allowed('access_demands'),                (req, res) => res.render('stores/demands/index'));
    app.get('/stores/demands/:id',          isLoggedIn, allowed('access_demands'),                (req, res) => res.render('stores/demands/show', {tab: req.query.tab || 'details'}));
    app.get('/stores/demands/:id/download', isLoggedIn, allowed('access_demands'),                (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['_filename']
        })
        .then(demand => {
            if (demand._filename && demand._filename !== '') utils.download(demand._filename, req, res);
            else res.error.redirect(new Error('No file found'), req, res);
        })
        .catch(err => res.error.redirect(err, req, res));
    });

    app.post('/stores/demands',             isLoggedIn, allowed('demand_add',      {send: true}), (req, res) => {
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
    app.post('/stores/demand_lines',        isLoggedIn, allowed('demand_line_add', {send: true}), (req, res) => {
        demands.createLine({
            m: {
                sizes: m.sizes,
                demands: m.demands,
                demand_lines: m.demand_lines,
                notes: m.notes
            },
            line: req.body.line,
            user_id: req.user.user_id
        })
        .then(result => res.send({result: true, message: `Item added: ${result.line_id}`}))
        .catch(err => res.error.send(err, res))
    });

    app.put('/stores/demands/:id',          isLoggedIn, allowed('demand_edit',     {send: true}), (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            include: [inc.suppliers({as: 'supplier', file: true})],
            attributes: ['demand_id', '_status']
        })
        .then(demand => {
            if (Number(req.body._status) === 0) {
                if (demand._status === 0) res.send_error('This demand has already ben cancelled', res)
                else if (demand._status === 3) res.send_error('Closed demands can not be cancelled', res)
                else {
                    let actions = [];
                    actions.push(demand.update({_status: 0}));
                    actions.push(
                        m.demand_lines.update(
                            {_status: 0},
                            {where: {
                                demand_id: demand.demand_id,
                                _status:   {[op.or]: [1 ,2]}
                            }}
                        )
                    );
                    actions.push(
                        m.notes.create({
                            _table:  'demands',
                            _id:     demand.demand_id,
                            _note:   'Cancelled',
                            user_id: req.user.user_id,
                            _system:  1
                        }))
                    Promise.allSettled(actions)
                    .then(result => res.send({result: true, message: 'Demand Cancelled'}))
                    .catch(err => res.error.send(err, res));
                };
            } else if (Number(req.body._status) === 2) {
                if (demand._status !== 1) res.send_error('Only draft demands can be completed', res)
                else {
                    let actions = [];
                    actions.push(demand.update({_status: 2}));
                    actions.push(
                        m.demand_lines.update(
                            {_status: 2},
                            {where: {
                                demand_id: demand.demand_id,
                                _status:   1
                            }}
                        )
                    );
                    actions.push(
                        m.notes.create({
                            _table:  'demands',
                            _id:     demand.demand_id,
                            _note:   'Completed',
                            user_id: req.user.user_id,
                            _system:  1
                        })
                    );
                    Promise.allSettled(actions)
                    .then(result => {
                        if (demand.supplier.file) {
                            raiseDemandFile(demand.demand_id, req.user.user_id)
                            .then(filename => res.send({result: true, message: `Demand completed, filename: ${filename}`}))
                            .catch(err => res.error.send(err, res));
                        } else res.send({result: true, message: 'Demand completed'});
                    })
                    .catch(err => res.error.send(err, res));
                };
            } else if (Number(req.body._status) === 3) {
                if (demand._status !== 2) res.send_error('Only complete demands can be completed', res)
                else {
                    m.demand_lines.findAll({
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
                                m.demand_lines.update(
                                    {_status: 3},
                                    {where: {
                                        demand_id: demand.demand_id,
                                        _status:   2
                                    }}
                                )
                            );
                            actions.push(
                                m.notes.create({
                                    _table:  'demands',
                                    _id:     demand.demand_id,
                                    _note:   'Closed',
                                    user_id: req.user.user_id,
                                    _system:  1
                                })
                            );
                            Promise.allSettled(actions)
                            .then(result => res.send({result: true, message: 'Demand Closed'}))
                            .catch(err => res.error.send(err, res));
                        };
                    })
                };
            } else res.send_error('Invalid status', res);
        })
        .catch(err => res.error.send(err, res));
    });
    app.put('/stores/demand_lines/:id',     isLoggedIn, allowed('receipt_add',     {send: true}), (req, res) => {
        m.demands.findOne({
            where: {demand_id: req.params.id},
            attributes: ['demand_id', 'supplier_id']
        })
        .then(demand => {
            let actions = [], receives = [];
            for (let [lineID, line] of Object.entries(req.body.actions)) {
                line.line_id = Number(String(lineID).replace('line_id', ''));
                if (line._status === 3) {
                    receives.push(line);
                } else if (line._status === 0) {
                    actions.push(
                        m.demand_lines.update(
                            {_status: 0},
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
                            _system:  1
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
    
    raise_demand = demand_id => new Promise((resolve, reject) => {
        //check the demand is not already raised
        m.demands.findOne({
            where: {demand_id:demand_id},
            include: [
                inc.suppliers({
                    as: 'supplier',
                    file: true,
                    account: true
                })
            ],
            attributes: ['_filename']
        })
        .then(demand => {
            //check template file exists
            if (!demand._filename || demand._filename === '') {
                //check demand has open lines
                m.demand_lines.findAll({
                    where: {
                        demand_id: demand_id,
                        _status: 2
                    },
                    include: [inc.order_lines({orders: true})]
                })
                .then(lines => {
                    if (lines) {

                    } else reject(new Error('No open lines for this demand')
                })
                .catch(err => reject(err));
            } else reject(new Error('Demand has already been raised'));
        })
        .catch(err => reject(err));
    });
        //get the template file
        //get demand lines (inc order lines and order for cadet names)
            //sort demand lines, correlate items
            //sort demand lines, correlate users
        //create new demand file
            //write cover sheet
            //write items sheets
        //update demand lines as demanded
        //update demand with filename


    function raiseDemandFile (demand_id, user_id) {
        return new Promise((resolve, reject) => {
            m.demands.findOne({
                where: {demand_id: demand_id},
                include: [
                    inc.suppliers({
                        as: 'supplier',
                        file: true,
                        account: true}),
                    inc.demand_lines({
                        where: {_status: 2},
                        include: [
                            inc.sizes(),
                            inc.order_lines({
                                as: 'order_lines',
                                orders: true})
            ]})]
            })
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
                                demand.update({_filename: demandFile})
                                .then(result => {
                                    m.notes.create({
                                        _table: 'demands',
                                        _id: demand_id,
                                        _note: 'File created',
                                        user_id: user_id,
                                        _system: 1
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