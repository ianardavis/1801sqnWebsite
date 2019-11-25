const fn = {},
      m  = require('./models'),
      op = require('sequelize').Op
      cn = require('./constructors'), 
      se = require("sequelize"),
      fs = require('fs'),
      excel = require('exceljs');
var currentLine;

fn.allowed = (permission, redirectIfDenied, req, res, cb) => {
    if (res.locals.permissions[permission]) {
        cb(true);
    } else {
        if (redirectIfDenied) {
            req.flash('danger', 'Permission denied!');
            res.redirect('back');
        } else {
            cb(false);
        };
    };
    return null;
}; //OK
fn.getAllWhere = (table, where, include = []) => {
    return new Promise((resolve, reject) => {
        var singular = fn.singularise(table.tableName);
        table.findAll({
            where: where,
            include: include
        })
        .then(results => {
            if (results) {
                resolve(results);
            } else {
                reject(new Error('No ' + table.tableName + ' found'))
            };
        })
        .catch(err => {
            reject(err)
        });
    });
}; //OK
fn.getAll = (table, include = []) => {
    return new Promise((resolve, reject) => {
        table.findAll({
            include: include
        })
        .then(results => {
            resolve(results);
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK
fn.getOne = (table, where, include = [], attributes = null) => {
    return new Promise((resolve, reject) => {
        table.findOne({
            attributes: attributes,
            where:      where,
            include:    include
        })
        .then(result => {
            if (result) {
                resolve(result);
            } else {
                reject(new Error(fn.singularise(table.tableName, true) + ' not found'));
            };
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK
fn.create = (table, record) => {
    return new Promise((resolve, reject) => {
        table.create(record)
        .then(record => {
            resolve(record);
        })
        .catch(err => {
           reject(err);
        });
    });
}; //OK
fn.update = (table, record, where) => {
    return new Promise((resolve, reject) => {
        table.update(
            record,
            {where: where})
        .then(result => {
            if (result) {
                resolve(result);
            } else {
                reject(new Error(fn.singularise(table.tableName, true) + ' not updated'))
            };
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK
fn.delete = (table, where) => {
    return new Promise((resolve, reject) => {
        table.destroy(
            {where: where})
        .then(result => {
            if (result === 1) {
                resolve(result);
            } else {
                reject(new Error(fn.singularise(table.tableName) + ' not deleted'))
            }
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK
fn.singularise = (str, capitalise = false) => {
    var string = se.Utils.singularize(str);
    if (capitalise) {
        string = string.substring(0, 1).toUpperCase() + string.substring(1, string.length);
    };
    return string;
}; //OK
fn.error = (err, redirect, req, res) => {
    console.log(err);
    req.flash('danger', err.message);
    res.redirect(redirect);
}; //OK

fn.summer = items => {
    if (items == null) {
        return 0;
    }
    return items.reduce((a, b) => {
        return b['_qty'] == null ? a : a + b['_qty'];
    }, 0);
}; //OK
fn.counter = () => {
    var count = 0;
    return function() {
        return ++count;
    };
}; //OK
fn.addYears = (addYears = 0) => {
    var newDate = new Date();
    var dd = String(newDate.getDate()).padStart(2, '0');
    var MM = String(newDate.getMonth() + 1).padStart(2, '0');
    var yyyy = newDate.getFullYear() + addYears;

    newDate = yyyy + '-' + MM + '-' + dd;
    return newDate;
};
fn.timestamp = () => {
    var current = new Date(),
        year = String(current.getFullYear()),
        month = String(current.getMonth()),
        day = String(current.getDate()),
        hour = String(current.getHours()),
        minute = String(current.getMinutes()),
        second = String(current.getSeconds());
        
    return year + month + day + ' ' + hour + minute + second;
};

fn.item_sizes = (stock = false, items = true, nsns = false) => {
    var includes = [m.sizes];
    if (stock) {includes.push(fn.stock())};
    if (items) {includes.push(m.items)};
    if (nsns) {includes.push(m.nsns)};
    return {model: m.item_sizes, include: includes};
}; //OK
fn.users = (as = 'user') => {
    return {model: m.users, as: as, include: [m.ranks]};
}; //OK
fn.userInclude = (orders = false, issues = false, requests = false) => {
    var include = [
        m.ranks, 
        m.genders, 
        m.statuses, 
        m.permissions
    ];
    if (orders) {
        include.push({
            model: m.orders,
            include: [{model: m.orders_l, as: 'lines'}]
        });
    };
    if (issues) {
        include.push({
            model: m.issues,
            include: [{model: m.issues_l, as: 'lines'}]
        });
    };
    if (requests) {
        include.push({
            model: m.requests,
            include: [{model: m.requests_l, as: 'lines'}]
        });
    };
    return include;
};
fn.stock = () => {
    return {model: m.stock, include: [m.locations]};
};
fn.issuesInclude = includeLines => {
    var include = [
        fn.users('issuedTo'),
        fn.users('issuedBy')];
    if (includeLines) {
        include.push({
            model: m.issues_l,
            as: 'lines',
            include: [
                m.nsns,
                fn.users(),
                fn.item_sizes(true, true),
                fn.locations('issueStock'),
                fn.locations('returnStock')
            ]
        });
    };
    return include;
}; //OK
fn.itemSizeInclude = (nsns, stock, issues, orders, requests) => {
    var include = [
        m.items, 
        m.sizes, 
        m.suppliers
    ];
    if (requests.include)  include.push(
        {
            model: m.requests_l,
            where: requests.where,
            required: false,
            include: [{
                model: m.requests,
                include:[
                    fn.users('requestedFor')
                ]
            }]
        });
    if (issues.include)    include.push(
        {
            model: m.issues_l,
            where: issues.where,
            required: false,
            include: [
                fn.users(),
                {
                    model: m.issues,
                    include: [
                        fn.users('issuedTo')
                    ]
                }
            ]
        });
    if (orders.include)    include.push(
        {
            model: m.orders_l,
            where: orders.where,
            required: false,
            include: [{
                model: m.orders,
                include: [
                    fn.users('orderedFor')
                ]
            }]
        });
    if (nsns.include)  include.push(m.nsns);
    if (stock.include) include.push(fn.stock());
    return include;
}; //OK

fn.getOptions = (options, req, cb) => {
    var gets = [];
    options.map(option => {
        gets.push(
            new Promise((resolve, reject) => {
                m[option.table].findAll({
                    include: option.include || []
                }).then(results => {
                    resolve({table: option.table, success: true, result: results});
                }).catch(err => {
                    console.log(err);
                    reject({table: option.table, success: false, result: err});
                });
            })
        );
    });
    Promise.all(gets)
    .then(results => {
        var options = {};
        results.forEach(result => {
            if (result.success) {
                options[result.table] = (result.result);
            } else {
                req.flash('info', 'No ' + result.table + ' found!');
            };
        });
        cb(options);})
    .catch(err => {
        console.log(err);
        cb(null);
    })
}; //OK

fn.addStock = (stock_id, qty) => {
    return new Promise((resolve, reject) => {
        fn.getOne(
            m.stock,
            {stock_id: stock_id}
        )
        .then(stock => {
            fn.update(
                m.stock,
                {_qty: stock._qty + Number(qty)},
                {stock_id: stock_id}
            )
            .then(result => {
                resolve(result);
            })
            .catch(err => {
                reject(err);
            });
        })
        .catch(err => {
            reject(err);
        })
    });
}; //OK
fn.subtractStock = (stock_id, qty) => {
    return new Promise((resolve, reject) => {
        fn.getOne(
            m.stock,
            {stock_id: stock_id}
        )
        .then(stock => {
            fn.update(
                m.stock,
                {_qty: stock._qty - Number(qty)},
                {stock_id: stock_id}
            )
            .then(result => {
                resolve(result);
            })
            .catch(err => {
                reject(err);
            });
        })
        .catch(err => {
            reject(err);
        })
    });
}; //OK

fn.addSize = (size_id, item_id) => {
    return new Promise((resolve, reject) => {
        fn.getOne(
            m.item_sizes, 
            {
                item_id: item_id,
                size_id: size_id
            }
        )
        .then(itemsize => {
            if (itemsize) {
                reject(new Error('A selected size is already assigned: ' + size_id));
            } else {
                req.body.details.size_id = size_id;
                fn.create(
                    m.item_sizes, 
                    req.body.details
                )
                .then(size => {
                    resolve(size);
                })
                .catch(err => {
                    reject(err);
                });
            };
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK

fn.getNotes = (table, id, req, res) => {
    return new Promise((resolve) => {
        fn.allowed('access_notes', false, req, res, (allowed) => {
            if (allowed || (table === 'users' && req.user.user_id === Number(id))) {
                var whereObj = {
                    _table: table, 
                    _id: id
                },
                sn = Number(req.query.sn) || 2;
                if (sn === 2) {
                    whereObj._system = false
                } else if (sn === 3) {
                    whereObj._system = true
                };
                fn.getAllWhere(
                    m.notes,
                    whereObj
                )
                .then(notes => {
                    resolve(notes);
                })
                .catch(err => {
                    req.flash('danger', 'Error searching notes')
                    console.log(err);
                    resolve(null);
                });
            } else {
                resolve(null);
            };
        });
    });
}; //OK

fn.processRequests = async function (req, res) {
    if (req.body.approves || req.body.declines) {
        var requests = [],
            issues   = [],
            orders   = [];
        req.body.approves.forEach(line => {
            if (line && line !== '') {
                line = JSON.parse(line);
                if (line._action === 'Issue') {
                    issues.push(line);
                } else if (line._action === 'Order') {
                    orders.push(line);
                };
            };
        });
        if (issues.length > 0) {
            var newIssue = new cn.Issue({issued_to: req.body.requested_for, _date: Date.now(), _date_due: fn.addYears(7)}, req.user.user_id)
            fn.create(
                m.issues,
                newIssue
            )
            .then(issue => {
                currentLine = fn.counter();
                var newNote = new cn.Note('issues', issue.issue_id, 'Generated from request: ' + req.params.id, true, req.user.user_id);
                requests.push(fn.create(m.notes, newNote));
                issues.forEach(line => {
                    if ((!req.body.nsns) || (!req.body.nsns['line' + line.line_id])) {
                        req.flash('danger', 'Can not issue line ' + line.line_id + ', No NSNs available');
                    } else {
                        line.nsn_id = Number(req.body.nsns['line' + line.line_id]);
                        var requestStatus = new cn.RequestStatus(line, req.user.user_id),
                            newLine       = new cn.IssueLine(issue.issue_id, line, currentLine());
                        requestStatus.issue_id = issue.issue_id
                        requests.push(fn.update(m.requests_l, requestStatus, {line_id: line.line_id}));
                        requests.push(fn.create(m.issues_l, newLine));
                        requests.push(fn.subtractStock(line.stock_id, line.qty));
                    }
                });
                if (currentLine() === 1) {
                    fn.delete(
                        m.issues, 
                        {issue_id: issue.issue_id}
                    )
                    .then(result => {
                        req.flash('info', 'No lines for issue, issue record deleted');
                    })
                    .catch(err => {
                        console.log(err);
                        req.flash('danger', 'No lines for issue, error deleting issue record');
                    });
                };
            })
            .catch(err => {
                console.log(err);
                req.flash('danger', err.message);
            });
        };
        if (orders.length > 0) {
            try {
                currentLine = fn.counter();
                var newOrder = new cn.Order(req.body.requested_for, req.user.user_id);
                fn.create(
                    m.orders,
                    newOrder
                )                    
                .then(order => {
                    var newNote = new cn.Note('orders', order.order_id, 'Generated from request: ' + req.params.id, true, req.user.user_id);
                    requests.push(fn.create(m.notes, newNote));
                    orders.forEach(line => {
                        var requestStatus = new cn.RequestStatus(line, req.user.user_id),
                            newline = new cn.OrderLine(order.order_id, line);
                        requestStatus.order_id = order.order_id;
                        requests.push(fn.create(m.orders_l, newline));
                        requests.push(fn.update(m.requests_l, requestStatus, {line_id: line.line_id}));
                        currentLine();
                    });
                    if (currentLine() === 1) {
                        fn.delete(
                            m.orders, 
                            {order_id: order.order_id}
                        )
                        .then(result => {
                            req.flash('info', 'No lines for order, order record deleted');
                        })
                        .catch(err => {
                            console.log(err);
                            req.flash('danger', 'No lines for order, error deleting order record');
                        });
                    };
                })
                .catch(err => {
                    req.flash('danger', err.message);
                    console.log(err);
                });
            } catch(err) {
                req.flash('danger', err.message);
                console.log(err);
            };
        };
        req.body.declines.map(line => {
            if (line !== 'pending' && line !== 'approved') {
                line = JSON.parse(line);
                if (line._status === 'Declined') {
                    var requestStatus = new cn.RequestStatus({_status: 'Declined', _action: null}, req.user.user_id);
                    requests.push(fn.update(m.requests_l, requestStatus, {line_id: line.line_id}));
                };
            };
        });
        
        Promise.all(requests)
        .then(results => {
            fn.closeIfNoLines(
                m.requests,
                m.requests_l,
                {request_id: Number(req.params.id)},
                {_status: 'Pending'}
            )
            .then(result => {
                if (result[0] === 1) req.flash('info', 'Request closed')
                res.redirect('/stores/requests/' + req.params.id);
            })
            .catch(err => {
                fn.error(err, '/stores/requests', req, res);
            });
        })
        .catch(err => {
            fn.error(err, '/stores/requests', req, res);
        });
    } else {
        req.flash('info', 'No requests selected!');
        res.redirect('/stores/requests');
    };
}; /////// refactor ////////////
fn.receiveLine = (receipt, stock) => {
    return new Promise((resolve, reject) => {
        fn.update(
            m.stock,
            {_qty: stock._qty},
            {stock_id: stock.stock_id}
        )
        .then(result => {
            if (result) {
                fn.create(
                    m.receipts_l,
                    receipt
                )
                .then(newReceipt => {
                    resolve(newReceipt);
                }).catch(err => {
                    reject(err);
                });
            } else {
                reject(new Error('Error updating stock'));
            };
        }).catch(err => {
            reject(err);
        });
    });
}; //OK
fn.receiveStock = (items, supplier_id, user_id) => {
    return new Promise((resolve, reject) => {
        var newReceipt = new cn.Receipt(supplier_id, user_id);
        fn.create(
            m.receipts,
            newReceipt
        )
        .then(receipt => {
            var actions = [],
                count = fn.counter();
            items.forEach(item => {
                var newLine = new cn.ReceiptLine(item.stock_id, item.qty, receipt.receipt_id);
                actions.push(fn.create(m.receipts_l, newLine));
                actions.push(fn.addStock(item.stock_id, item.qty));
                count();
            });
            Promise.all(
                actions
            )
            .then(results => {
                if (count() > 1) {
                    resolve(receipt.receipt_id);
                } else {
                    fn.delete(
                        m.receipts,
                        {receipt_id: receipt.receipt_id}
                    )
                    .then(result => {
                        reject(new Error('No lines, ' + fn.singularise(m.receipts.tableName) + ' deleted'));
                    })
                    .catch(err => {
                        reject(err);
                    });
                };
            })
            .catch(err => {
                reject(err);
            })
        })
        .catch(err => {
            reject(err);
        });
    });
};
fn.returnLine = (line, user_id) => {
    return new Promise((resolve, reject) => {
        var returned = new cn.Returned(user_id, line.stock_id);
        fn.getOne(
            m.issues_l,
            {line_id: line.line_id},
            [m.issues])
        .then(issue => {
            if (Number(issue.issue.issued_to) !== Number(user_id)) {
                fn.update(
                    m.issues_l,
                    returned,
                    {line_id: line.line_id})
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
            } else {
                reject(new Error('You cannot return items issued to yourself: ' + line.line_id));
            };
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK
fn.closeIfNoLines = (table, table_l, id, where) => {
    return new Promise((resolve, reject) => {
        table_l.findOne({
            where: {
                ...id, 
                ...where
            }
        })
        .then(result => {
            if (!result) {
                fn.update(
                    table,
                    {_complete: true},
                    id
                )
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
            } else {
                resolve(false);
            };
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK

fn.getUndemandedOrders = supplier_id => {
    return new Promise((resolve, reject) => {
        fn.getAllWhere(
            m.orders_l,
            {demand_line_id: null},
            [
                {
                    model: m.orders,
                    include: [fn.users('orderedFor')]
                },{
                    model: m.item_sizes,
                    where: {supplier_id: supplier_id}
                }
            ]
        )
        .then(orders => {
            resolve(orders);
        })
        .catch(err => {
            reject(err);
        })
    });
}; //OK
fn.sortOrdersForDemand = orderList => {
    return new Promise((resolve, reject) => {
        try {
            var orders  = [],
                users   = [],
                rejects = [];
            orderList.forEach(order => {
                if (order.size._demand_page === null || order.size._demand_page === '') {
                    rejects.push({line_id: order.line_id, reason: 'page'});
                } else if (order.size._demand_cell === null || order.size._demand_cell === '') {
                    rejects.push({line_id: order.line_id, reason: 'cell'});
                } else {
                    var existing = orders.findIndex(e => e.itemsize_id === order.itemsize_id);
                    if (existing === -1) {
                        orders.push({
                            lines:    [order.line_id],
                            itemsize_id: order.itemsize_id,
                            page:     order.size._demand_page, 
                            cell:     order.size._demand_cell, 
                            qty:      order._qty
                        });
                    } else {
                        orders[existing].qty += order._qty
                        orders[existing].lines.push(order.line_id);
                    };
                    var user = {
                        rank: order.order.orderedFor.rank._rank, 
                        name: order.order.orderedFor._name, 
                        bader: order.order.orderedFor._bader
                    };
                    if (!users.some(e => e.bader === user.bader)) {
                       users.push(user);
                    };
                };
            });
            resolve({orders: orders, rejects: rejects, users: users});
        } catch(err) {
            reject(err);
        };
    });
}; //OK

fn.raiseDemand = (supplier_id, orders, users) => {
    return new Promise((resolve, reject) => {
        fn.createDemandFile(
            supplier_id
        )
        .then(file => {
            fn.writeItems(
                file, 
                orders
            )
            .then(writeItemResults => {
                if (writeItemResults.success.length > 0) {
                    fn.writeCoverSheet(file, supplier_id, users)
                    .then(coverSheetResults => {
                        resolve({items: writeItemResults, file: file})
                    })
                    .catch(err => {
                        reject(err);
                    });
                } else {
                    reject(new Error('No items written to demand'));
                };
            })
            .catch(err => {
                reject(err);
            });
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK
fn.createDemandFile = supplier_id => {
    return new Promise((resolve, reject) => {
        fn.getSupplier(supplier_id, false, true, false)
        .then(supplier => {
            if (supplier) {
                if (supplier.file._path) {
                    var path       = process.env.ROOT + '/public/res/',
                        newDemand  = 'demands/' + fn.timestamp() + ' ' + supplier._name + '.xlsx',
                        demandFile = path + supplier.file._path;
                    fs.copyFile(demandFile, path + newDemand, err => {
                        if (!err) {
                            resolve(path + newDemand);
                        } else {
                            reject(err);
                        };
                    });
                } else {
                    reject(new Error('No demand file specified'));
                };
            } else {
                reject(new Error('Supplier not found'));
            };
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK
fn.writeItems = (file, orders) => {
    return new Promise((resolve, reject) => {
        var workbook = new excel.Workbook();
        workbook.xlsx.readFile(file)
        .then(() => {
            var success = [],
                fails   = [];
            orders.forEach(order => {
                try {
                    var worksheet = workbook.getWorksheet(order.page),
                        cell = worksheet.getCell(order.cell);
                    cell.value = order.qty;
                    success.push({
                        lines: order.lines, 
                        itemsize_id: order.itemsize_id, 
                        qty: order.qty
                    });
                } catch(err) {
                    fails.push({
                        lines: order.lines, 
                        reason: err.message
                    });
                };
            });
            workbook.xlsx.writeFile(file).then(() => {
                resolve({success: success, fails: fails});
            })
            .catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
}; //OK
fn.writeCoverSheet = (file, supplier_id, users) => {
    return new Promise((resolve, reject) => {
        var workbook = new excel.Workbook();
        workbook.xlsx.readFile(file)
        .then(() => {
            fn.getSupplier(supplier_id, false, true, true)
            .then(supplier => {
                try {
                    var worksheet = workbook.getWorksheet(supplier.file._cover_sheet),
                        fields = ['_code', '_rank', '_name', '_sqn'];
                    fields.forEach(field => {
                        if (supplier.file[field] && supplier.file[field] !== '' &&
                            supplier.inventory[field] && supplier.inventory[field] !== ''
                            ){
                                var cell = worksheet.getCell(supplier.file[field]);
                                cell.value = supplier.inventory[field];
                            }
                    });
                    var cell = worksheet.getCell(supplier.file._date),
                        now  = new Date(),
                        line = fn.counter();
                    for (let r = Number(supplier.file._request_start); r <= Number(supplier.file._request_end); r++) {
                        var rankCell = worksheet.getCell(supplier.file._rank_column + r),
                            nameCell = worksheet.getCell(supplier.file._name_column + r),
                            currentLine = line() - 1,
                            sortedKeys = Object.keys(users).sort(),
                            user = users[sortedKeys[currentLine]];
                        if (user) {
                            rankCell.value = user.rank;
                            nameCell.value = user.name + ' (' + user.bader + ')';
                        } else {
                            break;
                        };
                    };
                    cell.value = now.toDateString();
                    workbook.xlsx.writeFile(file)
                    .then(() => {
                        resolve(true);
                    })
                    .catch(err => {
                        reject(err);
                    });
                } catch(err) {
                    reject(err);
                }
            })
            .catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
}; //OK

fn.addDemandToOrders = (supplier_id, results, user_id) => {
    return new Promise((resolve, reject) => {
        var newDemand = new cn.Demand(
            supplier_id, 
            results.file, 
            user_id);
        fn.create(
            m.demands, 
            newDemand
        )
        .then(demand => {
            var demandLines = [];
            results.items.success.forEach(demandedLine => {
                demandLines.push(fn.createDemandLine(demand.demand_id, demandedLine));
            });
            Promise.all(demandLines)
            .then(results => {
                resolve({lineResults: results, demand_id: demand.demand_id})
            })
            .catch(err => {
                reject(err);
            });
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK
fn.createDemandLine = (demand_id, demandedLine) => {
    return new Promise((resolve, reject) => {
        var newDemandLine = new cn.DemandLine(
            demand_id, 
            demandedLine.itemsize_id, 
            demandedLine.qty)
        fn.create(
            m.demands_l, 
            newDemandLine
        )
        .then(demandLine => {
            var orders = [];
            demandedLine.lines.forEach(order_line_id => {
                orders.push(fn.updateOrderLine(demandLine.line_id, order_line_id))
            });
            Promise.all(orders)
            .then(results => {
                resolve(results);
            })
            .catch(err => {
                reject(err);
            });
        })
        .catch(err => {
            reject(err);
        });
    });
}; //OK
fn.updateOrderLine = (demand_line_id, order_line_id) => {
    return new Promise((resolve, reject) => {
        fn.update(
            m.orders_l, 
            {demand_line_id: demand_line_id}, 
            {line_id: order_line_id},
        )
        .then(updateResult => {
            resolve({order_line_id: order_line_id, result: updateResult});
        })
        .catch(err => {
            reject(err)
        });
    });
}; //OK

fn.cancelDemandLines = lines => {
    return new Promise((resolve, reject) => {
        lines.forEach(line_id => {
            fn.update(
                m.demands_l, 
                {_status: 'Cancelled'}, 
                {line_id: Number(line_id)}
            )
            .then(result1 => {
                fn.update(
                    m.orders_l,
                    {demand_line_id: null},
                    {demand_line_id: Number(line_id)}
                )
                .then(result2 => {
                    resolve({demands: result1, orders: result2});
                })
                .catch(err => {
                    reject(err);
                });
            })
            .catch(err => {
                reject(err);
            });

        });
    });
}; //OK
fn.receiveDemandLines = lines => {
    return new Promise((resolve, reject) => {
        resolve(true);
    });
}; //OK
module.exports = fn;