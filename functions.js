const op = require('sequelize').Op,
      cn = require(process.env.ROOT + '/db/constructors'), 
      se = require("sequelize"),
      fs = require('fs'),
      ex = require('exceljs'),
      pd = require('pdfkit');
var supplier_id,
    demand_id;
module.exports = (fn, m, inc) => {
    fn.getPermissions = user_id => new Promise((resolve, reject) => {
        fn.getOne(
            m.permissions,
            {user_id: user_id},
            {attributes: {exclude: ['createdAt', 'updatedAt', 'user_id']}}
        )
        .then(permissions => resolve(permissions))
        .catch(err => reject(err));
    });
    fn.getAllWhere = (table, where, options = {}) => new Promise((resolve, reject) => {
        table.findAll({
            attributes: options.attributes || null,
            where: where,
            include: options.include || []
        })
        .then(results => {
            if (results) resolve(results);
            else if (options.nullOk) resolve(null);
            else reject(new Error('No ' + table.tableName + ' found'));
        })
        .catch(err => reject(err));
    });
    fn.getAll = (table, include = []) => new Promise((resolve, reject) => {
        table.findAll({include: include})
        .then(results => resolve(results))
        .catch(err => reject(err));
    });
    fn.getOne = (table, where, options = {}) => new Promise((resolve, reject) => {
        table.findOne({
            attributes: options.attributes || null,
            where: where,
            include: options.include || []
        })
        .then(result => {
            if (result) resolve(result);
            else if (options.nullOK) resolve(null)
            else reject(new Error(fn.singularise(table.tableName, true) + ' not found'));
        })
        .catch(err => reject(err));
    });
    fn.create = (table, record) => new Promise((resolve, reject) => {
        table.create(record)
        .then(created => resolve(created))
        .catch(err => {
            if (err.parent && err.parent.code === 'ER_DUP_ENTRY') reject(new Error(err.parent.sqlMessage));
            else reject(err);
        });
    });
    fn.update = (table, record, where, nullOk = false) => new Promise((resolve, reject) => {
        table.update(
            record,
            {where: where})
        .then(result => {
            if (result) resolve(result);
            else if (nullOk) resolve(result)
            else reject(new Error(fn.singularise(table.tableName) + ' not updated',));
        })
        .catch(err => reject(err));
    });
    fn.delete = (table, where, options = {warn: true}) => new Promise((resolve, reject) => {
        m[table].destroy({where: where})
        .then(result => {
            if (options.hasLines) {
                let line_table = table.substring(0, table.length - 1) + '_lines'
                m[line_table].destroy({where: where})
                .then(result_l => {
                    if (!result && !result_l)     resolve({success: 'danger',  message: 'No ' + table + ' or lines deleted'})
                    else if (!result && result_l) resolve({success: 'danger',  message: 'No ' + table + ' deleted, lines deleted'})
                    else if (result && !result_l) resolve({success: 'danger',  message: table + ' deleted, no lines deleted'})
                    else                          resolve({success: 'success', message: table + ' and lines deleted OK'});
                })
                .catch(err => reject(err))
            } else if (!result && options.warn) reject(new Error('No ' + table.tableName + ' deleted'))
            else resolve(result);
        })
        .catch(err => reject(err));
    });
    fn.getSetting = (options = {}) => new Promise((resolve, reject) => {
        m.settings.findOrCreate({
            where: {_name: options.setting},
            defaults: {_value: options.default || ''}
        })
        .then(([f_setting, created]) => {
            if (created) console.log('Setting created on find: ' + options.setting);
            resolve(f_setting._value);
        })
        .catch(err => {
            console.log(err);
            reject(null);
        });
    });
    fn.editSetting = (setting, value) => new Promise((resolve, reject) => {
        fn.update(
            m.settings,
            {_value: value},
            {_name: setting},
            true
        )
        .then(result => resolve(result))
        .catch(err => {
            console.log(err);
            reject(false);
        });
    });
    fn.singularise = (str, capitalise = false) => {
        let string = se.Utils.singularize(str);
        if (capitalise) string = fn.capitalise(string)
        return string;
    };
    fn.capitalise = str => {return str.substring(0, 1).toUpperCase() + str.substring(1, str.length)};
    fn.error = (err, redirect, req, res) => {
        console.log(err);
        req.flash('danger', err.message);
        res.redirect(redirect);
    };

    fn.summer = items => {
        if (items == null) return 0;
        return items.reduce((a, b) => {
            return b['_qty'] == null ? a : a + b['_qty'];
        }, 0);
    };
    fn.counter = () => {
        let count = 0;
        return () => {
            return ++count;
        };
    };
    fn.addYears = (addYears = 0) => {
        let newDate = new Date(),
            dd = String(newDate.getDate()).padStart(2, '0'),
            MM = String(newDate.getMonth() + 1).padStart(2, '0'),
            yyyy = newDate.getFullYear() + addYears;
        newDate = yyyy + '-' + MM + '-' + dd;
        return newDate;
    };
    fn.timestamp = () => {
        let current = new Date(),
            year = String(current.getFullYear()),
            month = String(current.getMonth()),
            day = String(current.getDate()),
            hour = String(current.getHours()),
            minute = String(current.getMinutes()),
            second = String(current.getSeconds());
        return year + month + day + ' ' + hour + minute + second;
    };

    fn.getOptions = (options, req) => new Promise((resolve, reject) => {
        let actions = [];
        options.forEach(option => {
            actions.push(
                new Promise((resolve, reject) => {
                    fn.getAll(m[option.table], option.include || [])
                    .then(results => resolve({table: option.table, success: true, result: results}))
                    .catch(err => {
                        console.log(err);
                        reject({table: option.table, success: false, result: err});
                    });
                })
            );
        });
        Promise.allSettled(actions)
        .then(results => {
            let options = {};
            results.forEach(result => {
                if (result.value.success) options[result.value.table] = (result.value.result);
                else req.flash('info', 'No ' + result.value.table + ' found!');
            });
            resolve(options);
        })
        .catch(err => {
            console.log(err);
            resolve(null);
        })
    });

    fn.addStock = (stock_id, qty, table = 'stock') => new Promise((resolve, reject) => {
        m[table].findByPk(stock_id)
        .then(stock => stock.increment('_qty', {by: qty}))
        .then(stock => resolve(stock.qty))
        .catch(err => reject(err));
    });
    fn.subtractStock = (stock_id, qty, table = 'stock') => new Promise((resolve, reject) => {
        m[table].findByPk(stock_id)
        .then(stock => stock.decrement('_qty', {by: qty}))
        .then(stock => resolve(stock.qty))
        .catch(err => reject(err));
    });

    fn.addSize = (size, details) => new Promise((resolve, reject) => {
        fn.getOne(
            m.sizes,
            {
                item_id: details.item_id,
                _size: size
            },
            {nullOK: true}
        )
        .then(itemsize => {
            if (itemsize) resolve({result: false, size: size, error: new Error('Size already exists')})
            else {
                details._size = size;
                fn.create(m.sizes, details)
                .then(itemsize => resolve({result: true, size: itemsize._size}))
                .catch(err => reject({result: false, size: size, error: err}));
            };
        })
        .catch(err => reject({ result: true, err: err }));
    });

    fn.getNotes = (table, id, req) => new Promise(resolve => {
        let whereObj = {_table: table, _id: id}, 
            system = Number(req.query.system) || 2;
        if (system === 2) whereObj._system = false
        else if (system === 3)  whereObj._system = true;
        fn.getAllWhere(m.notes, whereObj, {nullOk: true})
        .then(notes => resolve(notes))
        .catch(err => {
            req.flash('danger', 'Error searching notes');
            console.log(err);
            resolve(null);
        });
    });

    fn.processRequests = (body, user_id) => new Promise((resolve, reject) => {
        if (body.approves || body.declines) {
            let actions = [], issues = [], orders = {}, request_IDs = [], noNSNs = [];
            body.approves.forEach(line => {
                if (line && line !== '') {
                    line = JSON.parse(line);
                    if (line._action === 'Issue') {
                        if (!body.nsns || !body.nsns['line' + line.request_line_id]) noNSNs.push(line.request_line_id);
                        else {
                            line.nsn_id = Number(body.nsns['line' + line.request_line_id]);
                            if (!request_IDs.includes(line.request_id)) request_IDs.push(line.request_id);
                            issues.push(line);
                        };
                    } else if (line._action === 'Order') {
                        if (!request_IDs.includes(line.request_id)) request_IDs.push(line.request_id);
                        orders[line.size_id] = line;
                    };
                };
            });
            body.declines.forEach(line => {
                if (line !== 'pending' && line !== 'approved') {
                    line = JSON.parse(line);
                    if (line._status === 'Declined') {
                        if (!request_IDs.includes(line.request_id)) request_IDs.push(line.request_id);
                        actions.push(fn.updateRequestStatus(line.request_line_id, { _status: 'Declined' }, user_id));
                    };
                };
            });
            if (issues.length > 0) {
                actions.push(
                    fn.createIssue(
                        {issued_to: body.requested_for, _date: Date.now(), _date_due: fn.addYears(7)},
                        issues,
                        user_id,
                        {_text: 'Generated from request', _system: true}
                    )
                );
            };
            if (Object.keys(orders).length > 0) {
                actions.push(
                    fn.createOrder(
                        body.requested_for,
                        orders,
                        user_id,
                        {_text: 'Generated from request', _system: true}
                    )
                );
            };
            Promise.allSettled(actions)
            .then(results => {
                let checks = [];
                request_IDs.forEach(request_id => 
                    checks.push(
                        fn.closeIfNoLines(
                            m.requests,
                            m.request_lines,
                            {request_id: Number(request_id)},
                            { _status: 'Pending'}
                        )
                    )
                );
                Promise.allSettled(checks)
                .then(result => resolve(noNSNs))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        } else reject(new Error('No requests selected'));
    });
    fn.updateRequestStatus = (line_id, newStatus, user_id) => new Promise((resolve, reject) => {
        fn.update(
            m.request_lines,
            new cn.RequestStatus(newStatus, user_id),
            {line_id: line_id},
            true
        )
        .then(result => resolve(result))
        .catch(err => reject(err));
    });
    
    fn.closeIfNoLines = (table, table_l, id, where) => new Promise((resolve, reject) => {
        fn.getOne(
            table_l,
            {...id,...where},
            {nullOK: true}
        )
        .then(result => {
            if (!result) 
                fn.update(
                    table,
                    {_complete: true},
                    id
                )
                .then(closeResult => resolve(closeResult))
                .catch(err => reject(err));
            else resolve(false);
        })
        .catch(err => reject(err));
    });

    fn.getUndemandedOrders = supplier_id => new Promise((resolve, reject) => {
        fn.getAllWhere(
            m.order_lines,
            {demand_line_id: null},
            {
                include: [
                    {model: m.orders,     include: [fn.users('_for')]},
                    {model: m.sizes, where:   {supplier_id: supplier_id}}
                ],
                nullOk: true,
            }
        )
        .then(orders => {
            if (orders) resolve(orders)
            else reject(new Error('No undemanded orders found'));
        })
        .catch(err => reject(err));
    });
    fn.sortOrdersForDemand = orderList => new Promise((resolve, reject) => {
        try {
            let orders = [], users = [], rejects = [];
            orderList.forEach(order => {
                if (order.size._demand_page === null || order.size._demand_page === '') rejects.push({ line_id: order.line_id, reason: 'page' });
                else if (order.size._demand_cell === null || order.size._demand_cell === '') rejects.push({ line_id: order.line_id, reason: 'cell' });
                else {
                    let existing = orders.findIndex(e => e.size_id === order.size_id);
                    if (existing === -1) 
                        orders.push({
                            line_ids: [order.line_id],
                            size_id: order.size_id,
                            page: order.size._demand_page,
                            cell: order.size._demand_cell,
                            qty: order._qty
                        });
                    else {
                        orders[existing].qty += order._qty;
                        orders[existing].lines.push(order.line_id);
                    };
                    if (order.order.ordered_for !== -1 && !users.some(e => e.bader === order.order._for._bader)) {
                        let user = {
                            rank: order.order._for.rank._rank,
                            name: order.order._for._name,
                            bader: order.order._for._bader
                        };
                        users.push(user);
                    };
                };
            });
            resolve({orders: orders, rejects: rejects, users: users});
        } catch (err) {
            reject(err);
        };
    });

    fn.raiseDemand = (supplier_id, orders, users) => new Promise((resolve, reject) => {
        fn.getOne(
            m.suppliers,
            {supplier_id: supplier_id},
            {include: [m.files, {model: m.accounts, include: [inc.users()]}]}
        )
        .then(supplier => {
            if (supplier._raise_demand) {
                fn.createDemandFile(supplier)
                .then(file => {
                    fn.writeItems(file, orders)
                    .then(results1 => {
                        if (results1.success.length > 0)
                            fn.writeCoverSheet(
                                file,
                                supplier,
                                users
                            )
                            .then(results2 => resolve({items: results1, file: file}))
                            .catch(err => reject(err));
                        else reject(new Error('No items written to demand'));
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            } else resolve({items: {success: orders}, file: null});
        })
        .catch(err => reject(err));
    });
    fn.createDemandFile = supplier => new Promise((resolve, reject) => {
        if (supplier.file._path) {
            let path = process.env.ROOT + '/public/res/',
                newDemand = 'demands/' + fn.timestamp() + ' demand - ' + supplier._name + '.xlsx',
                demandFile = path + 'files/' + supplier.file._path;
            fs.copyFile(demandFile, path + newDemand, err => {
                if (!err) resolve(newDemand)
                else reject(err);
            });
        } else reject(new Error('No demand file specified'));
    });
    fn.writeItems = (file, orders) => new Promise((resolve, reject) => {
        let workbook = new ex.Workbook(),
            path = process.env.ROOT + '/public/res/';
        workbook.xlsx.readFile(path + file)
        .then(() => {
            let success = [],
                fails = [];
            orders.forEach(order => {
                try {
                    let worksheet = workbook.getWorksheet(order.page),
                        cell = worksheet.getCell(order.cell);
                    cell.value = order.qty;
                    success.push({
                        lines: order.line_ids,
                        size_id: order.size_id,
                        qty: order.qty
                    });
                } catch (err) {
                    fails.push({
                        lines: order.line_ids,
                        reason: err.message
                    });
                };
            });
            workbook.xlsx.writeFile(path + file)
            .then(() => resolve({success: success, fails: fails}))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    fn.writeCoverSheet = (file, supplier, users) => new Promise((resolve, reject) => {
        let workbook = new ex.Workbook(),
            path = process.env.ROOT + '/public/res/';
        workbook.xlsx.readFile(path + file)
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
                    line = fn.counter();

                for (let r = Number(supplier.file._request_start); r <= Number(supplier.file._request_end); r++) {
                    let rankCell = worksheet.getCell(supplier.file._rank_column + r),
                        nameCell = worksheet.getCell(supplier.file._name_column + r),
                        currentLine = line() - 1,
                        sortedKeys = Object.keys(users).sort(),
                        user = users[sortedKeys[currentLine]];
                    if (user) {
                        rankCell.value = user.rank;
                        nameCell.value = user.name + ' (' + user.bader + ')';
                    } else break;
                };
                cell.value = now.toDateString();
                workbook.xlsx.writeFile(path + file)
                .then(() => resolve(true))
                .catch(err => reject(err));
            } catch (err) {
                reject(err);
            }
        }).catch(err => reject(err));
    });

    fn.updateOrderLine = (demand_line_id, order_line_id) => new Promise((resolve, reject) => {
        fn.update(
            m.order_lines,
            {demand_line_id: demand_line_id},
            {line_id: order_line_id}
        )
        .then(updateResult => resolve({order_line_id: order_line_id, result: updateResult}))
        .catch(err => reject(err));
    });

    fn.cancelDemandLines = lines => new Promise((resolve, reject) => {
        let actions = [];
        lines.forEach(line_id => {
            actions.push(fn.update(
                m.demand_lines,
                {_status: 'Cancelled'},
                {line_id: line_id}
            ));
            actions.push(fn.update(
                m.order_lines,
                {demand_line_id: null},
                {demand_line_id: line_id}
            ));
        });
        Promise.allSettled(actions)
        .then(results => {
            fn.getOne(
                m.demand_lines,
                {line_id: lines[0]},
                {attributes: ['demand_id']}
            )
            .then(demand_line => {
                fn.closeIfNoLines(
                    m.demands,
                    m.demand_lines,
                    {demand_id: demand_line.demand_id},
                    {_status: 'Pending'}
                )
                .then(results => resolve({demandClosed: results}))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
    fn.processDemandLine = line => new Promise((resolve, reject) => {
        fn.getOne(
            m.demand_lines,
            {line_id: line.line_id},
            {include: [m.demands]}
        )
        .then(demand_line => {
            if (supplier_id === null) supplier_id = demand_line.demand.supplier_id;
            else if (supplier_id !== demand_line.demand.supplier_id) reject(new Error('Demand contains lines from different suppliers'));
            
            if (demand_id === null) demand_id = demand_line.demand_id;
            else if (demand_id !== demand_line.demand_id) reject(new Error('Request contains lines from different demands'));
            
            fn.getAllWhere(
                m.order_lines,
                {demand_line_id: line.line_id},
                {nullOk: true, attributes: ['line_id']}
            )
            .then(order_line_ids => {
                let result = {};
                result.stock_id     = line.stock_id;
                result.demand_qty   = Number(demand_line._qty);
                result.qty  = Number(line.qty);
                result.demand_line  = line.line_id;
                result.size_id = demand_line.size_id;
                if (order_line_ids) {
                    result.order_lines = [];
                    order_line_ids.forEach(order_line_id => result.order_lines.push(order_line_id.line_id));
                };
                resolve(result);
            })
            .catch(err => reject(err));
        })
        .catch(err => {
            console.log(err);
            reject(line.line_id);
        });
    });
    fn.receiveDemandLines = (lines, user_id) => new Promise((resolve, reject) => {
        let actions = [];
        supplier_id = null;
        demand_id = null;
        lines.forEach(line => actions.push(fn.processDemandLine(line)));
        Promise.allSettled(actions)
        .then(lines => {
            if (!supplier_id) reject(new Error('No supplier specified'));
            else if (!lines) reject(new Error('No lines selected'));
            else {
                let partials = [];
                lines.filter(e => e.value.demand_qty !== e.value.qty).forEach(line => {
                    let demand_line = line.value;
                    partials.push(
                        fn.update(
                            m.demand_lines,
                            {_qty: demand_line.qty},
                            {line_id: demand_line.demand_line}
                        )
                    )
                    if (demand_line.qty < demand_line.demand_qty) {
                        partials.push(
                            fn.createDemandLine(
                                demand_id,
                                {
                                    size_id: demand_line.size_id,
                                    qty: demand_line.demand_qty - demand_line.qty
                                }
                            )
                        )
                    }
                });
                fn.createReceipt(supplier_id, lines, user_id)
                .then(receipt_id => {
                    fn.closeIfNoLines(
                        m.demands,
                        m.demand_lines,
                        {demand_id: demand_id},
                        {_status: 'Pending'}
                    )
                    .then(result => {
                        fn.getAllWhere(
                            m.order_lines,
                            {
                                receipt_line_id: {[op.not]: null},
                                issue_line_id: null,
                            },{
                                include: [{
                                    model: m.orders,
                                    where: {ordered_for: -1}
                                }],
                                nullOk: true
                            }
                        )
                        .then(order_lines => {
                            if (order_lines) {
                                let orderActions = [], orders = [];
                                order_lines.forEach(line => {
                                    orderActions.push(
                                        fn.update(
                                            m.order_lines,
                                            {issue_line_id: -1},
                                            {line_id: line.line_id}
                                        )
                                    );
                                    if (!orders.includes(line.order.order_id)) orders.push(line.order.order_id);
                                });
                                Promise.allSettled(orderActions)
                                .then(results => {
                                    orders.forEach(order_id => {
                                        fn.closeIfNoLines(
                                            m.orders,
                                            m.order_lines,
                                            {order_id: order_id},
                                            {issue_line_id: null}
                                        )
                                        .then(results => resolve({demandClosed: result}))
                                        .catch(err => reject(err));
                                    });
                                })
                                .catch(err => reject(err));
                            } else resolve({demandClosed: result});
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

    fn.downloadFile = (file, res) => {
        let path = process.env.ROOT + '/public/res/';
        res.download(path + file, path + file, err => {
            if (err) {
                console.log(err);
                req.flash('danger', err.message);
            };
        });
    };
    fn.createLoanCard = issue_id => new Promise((resolve, reject) => {
        fn.getOne(
            m.issues,
            {issue_id: issue_id},
            {include: [
                inc.users({as: '_to'}),
                inc.users({as: '_by'}),
                inc.issue_lines({include: [
                    inc.nsns(),
                    inc.serials(),
                    inc.stock({size: true})
                ]})
            ]}
        )
        .then(issue => {
            try {
                let path = process.env.ROOT + '/public/res/',
                    docMetadata = {},
                    file = 'loancards/Issue ' + issue.issue_id + ' - ' + issue._to._name + '.pdf',
                    writeStream = fs.createWriteStream(path + file);
                docMetadata.Title = 'Loan Card - Issue: ' + issue.issue_id;
                docMetadata.Author = issue._by.rank._rank + ' ' + issue._by._name + ', ' + issue._by._ini;
                docMetadata.autoFirstPage = false;
                docMetadata.bufferPages = true;
                const doc = new pd(docMetadata);
                doc.pipe(writeStream);
                doc.font(process.env.ROOT + '/public/lib/fonts/myriad-pro/d (1).woff');
                fn.addPage(doc);
                fn.drawHeader(doc, issue);
                doc
                    .fontSize(10)
                    .text('NSN', 28, 225)
                    .text('Description', 123.81, 225)
                    .text('Size', 276.31, 225)
                    .text('Qty', 373.56, 225)
                    .text('Return Date', 404.21, 225)
                    .text('Signature', 499.745, 225)
                    .moveTo(28, 245).lineTo(567.28, 245).stroke();
                fn.drawIssues(doc, issue);
                fn.addPageNumbers(doc, issue.issue_id);
                doc.end();
                writeStream.on('finish', () => {
                    fn.update(
                        m.issues,
                        { _filename: file },
                        { issue_id: issue_id}
                    )
                    .then(result => resolve(file))
                    .catch(err => reject(err));
                });
            } catch (err) {
                reject(err)
            };
        })
        .catch(err => reject(err));
    });
    fn.addPage = doc => {
        let pageMetaData = {};
        pageMetaData.size    = 'A4';
        pageMetaData.margins = 28;
        doc.addPage(pageMetaData);    
    };
    fn.drawHeader = (doc, issue) => {
        try {
            doc
            .image(process.env.ROOT + '/public/img/rafac_logo.png', 28, 48, {fit: [112, 168]})
            .image(process.env.ROOT + '/public/img/sqnCrest.png', 470.25, 48, {height: 100})
            .fontSize(30)
            .text('1801 SQUADRON ATC', 154.12, 48, {align: 'justify'})
            .text('STORES LOAN CARD', 163.89, 98, {align: 'justify'})
            .moveTo(28, 170).lineTo(567.28, 170).stroke()
            .fontSize(15)
            .text('Rank: ' + issue._to.rank._rank, 28, 175)
            .text('Surname: ' + issue._to._name, 150, 175)
            .text('Initials: ' + issue._to._ini, 415, 175)
            .text('Bader/Service #: ' + issue._to._bader, 28, 195)
            .text('Date: ' + issue._date.toDateString(), 415, 195)
            .moveTo(28, 220).lineTo(567.28, 220).stroke();
        } catch(err) {
            console.log(err);
        };
    };
    fn.drawIssues = (doc, issue) => {
        try{
            let lineHeight = 250;
            issue.lines.forEach(line => {
                if (lineHeight >= 761.89) {
                    doc
                    .text('END OF PAGE', 268, lineHeight)
                    .addPage();
                    fn.drawHeader(doc, issue);
                };
                let nsn = '';
                if (line.nsn || line.serial) {
                    if (line.nsn) nsn += line.nsn._nsn + ' ';
                    if (line.serial) nsn += line.serial._serial
                };
                doc
                .text(nsn, 28, lineHeight)
                .text(line.stock.size.item._description || '', 123.81, lineHeight)
                .text(line.stock.size._size || '', 276.31, lineHeight)
                .text(line._qty, 373.56, lineHeight)
                .moveTo(28, lineHeight + 15).lineTo(567.28, lineHeight + 15).stroke();
                lineHeight += 20;
            });
            let close_text = 'END OF ISSUE, ' + issue.lines.length + ' LINES ISSUED';
            doc
            .text(close_text, 297.64 - (doc.widthOfString(close_text) / 2), lineHeight)
            .moveTo(116.81, 220).lineTo(116.81, lineHeight - 5).stroke()
            .moveTo(269.31, 220).lineTo(269.31, lineHeight - 5).stroke()
            .moveTo(366.56, 220).lineTo(366.56, lineHeight - 5).stroke()
            .moveTo(397.21, 220).lineTo(397.21, lineHeight - 5).stroke()
            .moveTo(116.81, 220).lineTo(116.81, lineHeight - 5).stroke()
            .moveTo(492.745, 220).lineTo(492.745, lineHeight - 5).stroke();
            lineHeight += 20;
            let disclaimer = 'By signing below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
            doc
            .text(disclaimer, 28, lineHeight, {width: 539.28, align: 'center'})
            .rect(197.64, lineHeight += 60, 200, 100).stroke();
        } catch(err) {
            console.log(err);
        };
    };
    fn.addPageNumbers = (doc, issue_id) => {
        const range = doc.bufferedPageRange();
        doc.fontSize(15);
        for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
            doc.switchToPage(i);
            doc
            .text(`Page ${i + 1} of ${range.count}`, 28, 803.89)
            .text('Issue ID: ' + issue_id, (567.28 - doc.widthOfString('Issue ID: ' + issue_id)), 803.89)
            .text(`Page ${i + 1} of ${range.count}`, 28, 28)
            .text('Issue ID: ' + issue_id, (567.28 - doc.widthOfString('Issue ID: ' + issue_id)), 28);
        }
    };

    fn.adjustStock = (_type, stock_id, qty, user_id) => new Promise((resolve, reject) => {
        if (String(_type).toLowerCase() === 'count' || String(_type).toLowerCase() === 'scrap') {
            let adjust = {};
            adjust.stock_id = stock_id;
            adjust._type = _type;
            adjust._qty = qty;
            adjust._date = Date.now();
            adjust.user_id = user_id;
            fn.getOne(
                m.stock,
                {stock_id: stock_id}
            )
            .then(stock => {
                adjust._qty_difference = qty - stock._qty;
                fn.create(
                    m.adjusts,
                    adjust
                )
                .then(newAdjust => {
                    if (String(adjust._type).toLowerCase() === 'count') {
                        fn.update(
                            m.stock,
                            {_qty: newAdjust._qty},
                            {stock_id: newAdjust.stock_id}
                        )
                        .then(result => resolve(newAdjust.adjust_id))
                        .catch(err => reject(err));
                    } else {
                        fn.subtractStock(
                            newAdjust.stock_id,
                            newAdjust._qty
                        )
                        .then(result => resolve(newAdjust.adjust_id))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        } else {
            reject(new Error('Invalid adjustment type'));
        };
    });

    fn.createRequest = (requestFor, lines, user_id) => new Promise((resolve, reject) => {
        let newRequest = new cn.Request(user_id, requestFor);
        fn.create(m.requests, newRequest)
        .then(request => {
            let actions = [];
            for (let [size_id, line] of Object.entries(lines)) {
                actions.push(
                    fn.create(
                        m.request_lines,
                        new cn.RequestLine(request.request_id, size_id, line.qty)
                    )
                );
            };
            if (actions.length > 0) {
                Promise.allSettled(actions)
                .then(results => {
                    console.log(results);
                    resolve(request.request_id);
                })
                .catch(err => reject(err));
            } else {
                fn.delete('requests', {request_id: request.request_id})
                .then(next => reject(new Error('No lines, request deleted')))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    });

    fn.createOrder = (orderFor, lines, user_id, orderNote = null) => new Promise((resolve, reject) => {
        let newOrder = new cn.Order(orderFor, user_id),
            order_line = fn.counter(),
            actions = [];
        fn.create(m.orders, newOrder)
        .then(order => {
            if (orderNote) {
                actions.push(
                    fn.create(
                        m.notes,
                        new cn.Note(
                            'orders',
                            order.order_id,
                            orderNote._text,
                            orderNote._system,
                            user_id
                        )
                    )
                );
            };
            for (let [size_id, line] of Object.entries(lines)) {
                if (typeof (line) !== 'object') line = JSON.parse(line);
                actions.push(
                    fn.createOrderLine(
                        order.order_id,
                        size_id,
                        line,
                        user_id
                    )
                );
                order_line();
            };
            if (order_line() === 1) {
                fn.delete('orders', {order_id: order.order_id})
                .then(result => reject(new Error('No order lines')))
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
            } else {
                Promise.allSettled(actions)
                .then(results => resolve(order.order_id))
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
            };
        })
        .catch(err => {
            console.log(err);
            reject(err);
        });
    });
    fn.createOrderLine = (order_id, size_id, line, user_id) => new Promise((resolve, reject) => {
        fn.create(
            m.order_lines,
            new cn.OrderLine(order_id, size_id, line.qty)
        )
        .then(order_lines => {
            if (line.request_line_id) {
                fn.updateRequestStatus(
                    line.request_line_id,
                    { _status: line._status, _action: line._action, _id: order_id},
                    user_id
                )
                .then(result => resolve(order_lines.line_id))
                .catch(err => reject(err));
            } else {
                resolve(order_lines.line_id);
            };
        })
        .catch(err => reject(err));
    });
    
    fn.createDemand = (supplier_id, lines, user_id, file = null) => new Promise((resolve, reject) => {
        let newDemand = new cn.Demand(supplier_id, user_id);
        if (file) newDemand._filename = file;
        fn.create(
            m.demands,
            newDemand
        )
        .then(demand => {
            let demandLines = [];
            lines.forEach(line => demandLines.push(fn.createDemandLine(demand.demand_id, line)));
            if (demandLines.length > 0) {
                Promise.allSettled(demandLines)
                .then(results => resolve(demand.demand_id))
                .catch(err => reject(err));
            } else reject(new Error('No demanded lines'));
        })
        .catch(err => reject(err));
    });
    fn.createDemandLine = (demand_id, line) => new Promise((resolve, reject) => {
        fn.create(
            m.demand_lines,
            new cn.DemandLine(demand_id, line.size_id, line.qty)
        )
        .then(demand_line => {
            if (line.lines) {
                let order_updates = [];
                line.lines.forEach(line_id => {
                    order_updates.push(
                        fn.update(
                            m.order_lines,
                            {demand_line_id: demand_line.line_id},
                            {line_id: line_id}
                        )
                    );
                });
                if (order_updates.length > 0) {
                    Promise.allSettled(order_updates)
                    .then(results => resolve(results))
                    .catch(err => reject(err));
                } else reject(new Error('No line IDs'));
            } else resolve(demand_line.line_id);
        })
        .catch(err => reject(err));
    });

    fn.createReceipt = (supplier_id, lines, user_id) => new Promise((resolve, reject) => {
        let newReceipt = new cn.Receipt(supplier_id, user_id);
        fn.create(
            m.receipts,
            newReceipt
        )
        .then(receipt => {
            let actions = [];
            for (let [key, line] of Object.entries(lines)) {
                actions.push(fn.createReceiptLine(receipt.receipt_id, line));
                actions.push(fn.addStock(line.stock_id, line.qty));
            };            
            if (actions.length > 0) {
                Promise.allSettled(actions)
                    .then(results => resolve(receipt.receipt_id))
                    .catch(err => reject(err));
            } else {
                fn.delete('receipts', {receipt_id: receipt.receipt_id})
                .then(result => reject(new Error('No lines, receipt deleted')))
                .catch(err => reject(err));
            };
        })
        .catch(err => reject(err));
    });
    fn.createReceiptLine = (receipt_id, line) => new Promise((resolve, reject) => {
        let newLine = new cn.ReceiptLine(line.stock_id, line.qty, receipt_id);
        fn.create(
            m.receipt_lines,
            newLine
        )
        .then(receipt_line => {
            let actions = [];
            if (line.demand_line) {
                actions.push(
                    fn.update(
                        m.demand_lines,
                        {_status: 'Received'},
                        {line_id: line.demand_line}
                    )
                )
            };
            if (line.order_lines) {
                line.order_lines.forEach(line_id => {
                    actions.push(
                        fn.update(
                            m.order_lines,
                            {receipt_line_id: receipt_line.line_id},
                            {line_id: line_id}
                        )
                    );
                });
            };
            if (actions.length > 0) {
                Promise.allSettled(actions)
                .then(results => resolve(receipt_line.line_id))
                .catch(err => reject(err));
            } else resolve(receipt_line.line_id);
        })
        .catch(err => reject(err));
    });

    fn.createIssue = (issueDetails, lines, user_id, issueNote = null) => new Promise((resolve, reject) => {
        if (lines && lines.length > 0) {
            fn.create(
                m.issues,
                new cn.Issue(issueDetails, user_id)
            )
            .then(issue => {
                let actions = [];
                if (issueNote) actions.push(fn.create(m.notes, new cn.Note('issues', issue.issue_id, issueNote._text, issueNote._system, user_id)));
                let currentLine = fn.counter();
                lines.forEach(line => {
                    if (line) {
                        if (typeof (line) !== 'object') line = JSON.parse(line);
                        actions.push(fn.createIssueLine(issue.issue_id, line, user_id, currentLine()))
                    };
                });
                Promise.allSettled(actions)
                .then(results => {
                    console.log(results);
                    if (currentLine() === 1) {
                        fn.delete('issues', {issue_id: issue.issue_id})
                        .then(result => reject(new Error('No lines on issue, issue deleted')))
                        .catch(err => reject(err));
                    } else {
                        fn.createLoanCard(issue.issue_id)
                        .then(file => resolve(issue.issue_id))
                        .catch(err => reject(err));
                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        } else reject(new Error('No items selected'));
    });
    fn.createIssueLine = (issue_id, line, user_id, lineNum) => new Promise((resolve, reject) => {
        fn.create(
            m.issue_lines,
            new cn.IssueLine(issue_id, line, lineNum)
        )
        .then(issue_line => {
            let actions = [];
            actions.push(fn.subtractStock(issue_line.stock_id, issue_line.qty));
            if (line.serial_id) {
                actions.push(
                    fn.update(
                        m.serials,
                        {issue_line_id: issue_line.line_id},
                        {serial_id: line.serial_id}
                    )
                );
            };
            if (line.request_line_id) {
                actions.push(
                    fn.updateRequestStatus(
                        line.request_line_id,
                        { _status: line._status, _action: line._action, _id: issue_id },
                        user_id
                    )
                );
            };
            if (line.order_line_id) {
                actions.push(
                    fn.update(
                        m.order_lines,
                        {issue_line_id: issue_line.line_id},
                        {line_id: line.order_line_id}
                    )
                );
            };
            if (actions.length > 0) {
                Promise.allSettled(actions)
                .then(result => resolve(issue_line.line_id))
                .catch(err => reject(err));
            } else resolve(issue_line.line_id);
            
        })
        .catch(err => reject(err));
    });

    fn.createReturn = (from, lines, user_id) => new Promise((resolve, reject) => {
        if (Number(from) !== Number(user_id)) {
            let newReturn = new cn.Return(from, user_id),
                return_line = fn.counter(),
                actions = [],
                issueIDs = [],
                stockToReturn = [];
            fn.create(
                m.returns,
                newReturn
            )
            .then(_return => {
                lines.forEach(line => {
                    line = JSON.parse(line);
                    let existing = stockToReturn.findIndex(e => e.stock_id === line.stock_id);
                    if (existing === -1) {
                        stockToReturn.push({
                            stock_id: line.stock_id,
                            qty: line.qty
                        });
                    } else stockToReturn[existing].qty += line.qty;
                    actions.push(fn.createReturnLine(_return.return_id, line));
                    if (!issueIDs.includes(line.issue_id)) issueIDs.push(line.issue_id);
                    return_line();
                });
                if (stockToReturn.length > 0) {
                    stockToReturn.forEach(stock => {
                        actions.push(fn.addStock(stock.stock_id, stock.qty));
                    });
                };
                if (return_line() === 1) {
                    fn.delete('returns', {return_id: _return.return_id})
                    .then(result => reject(new Error('No return lines')))
                    .catch(err => {
                        console.log(err);
                        reject(err);
                    });
                } else {
                    Promise.allSettled(actions)
                    .then(results => {
                        let checks = [];
                        issueIDs.forEach(issue_id => {
                            checks.push(fn.closeIfNoLines(m.issues, m.issue_lines, { issue_id: issue_id }, { return_line_id: null }));
                        });
                        Promise.allSettled(checks)
                        .then(results => resolve(_return.return_id))
                        .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
                };
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        } else reject(new Error('You cannot return items issued to yourself'));
    });
    fn.createReturnLine = (return_id, line) => new Promise((resolve, reject) => {
        let newLine = new cn.ReturnLine(return_id, line);
        fn.create(
            m.return_lines,
            newLine
        )
        .then(return_line => {
            let updateIssue = { return_line_id: return_line.line_id };
            let actions = [];
            actions.push(fn.update(m.issue_lines, updateIssue, { line_id: line.line_id }))
            fn.getOne(
                m.issue_lines,
                {line_id: line.line_id}
            )
            .then(issue => {
                if (issue.serial_id) actions.push(fn.update(m.serials, {issue_line_id: -1}, {serial_id: issue.serial_id}))
                Promise.allSettled(actions)
                .then(result => resolve(result))
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
            })
            .catch(err => reject(err));
            
        })
        .catch(err => {
            console.log(err);
            reject(err);
        });
    });

    fn.createCanteenSaleLine = (sale_id, lines) => new Promise((resolve, reject) => {
        let actions = [];
        for (let [_sale, line] of Object.entries(lines)) {
            fn.getOne(m.canteen_items, {item_id: line.item_id})
            .then(item => {
                actions.push(
                    fn.create(
                        m.canteen_sale_lines,
                        {
                            sale_id: sale_id,
                            item_id: line.item_id,
                            _qty: line.qty,
                            _cost_each: item._value
                        }
                    )
                );
                actions.push(fn.subtractCanteenStock(line.item_id, line.qty))
            })
            .catch(err => reject(err));
        };
        Promise.allSettled(actions)
        .then(results => resolve(true))
        .catch(err => reject(err));
    });
    fn.getSession = (req, res, options = {}) => new Promise(resolve => {
        fn.getSetting({setting: 'canteen_session', default: -1})
        .then(session_id => {
            if (Number(session_id) === -1 && options.redirect) {
                req.flash('danger', 'No session open');
                res.redirect('/canteen');
            } else resolve(session_id);
        })
        .catch(err => {
            fn.error(err, '/canteen', req, res)
        })
    });
    fn.getSale = (req, res) => new Promise(resolve => {
        fn.getSetting({setting: 'sale_' + req.user.user_id, default: -1})
        .then(sale_id => {
            if (Number(sale_id) === -1) {
                fn.getSession(req, res, {redirect: true})
                .then(session_id => {
                    fn.create(
                        m.canteen_sales,
                        {
                            session_id: session_id,
                            user_id: req.user.user_id
                        }
                    )
                    .then(sale => {
                        fn.editSetting('sale_' + req.user.user_id, sale.sale_id)
                        .then(result => {
                            if (result) resolve(sale.sale_id)
                            else fn.error(new error('User sale not saved to setting'), '/canteen', req, res);
                        })
                        .catch(err => fn.error(err, '/canteen', req, res));
                    })
                    .catch(err => fn.error(err, '/canteen', req, res));
                });
            } else resolve(sale_id);
        })
        .catch(err => fn.error(err, '/canteen', req, res));
    });
};