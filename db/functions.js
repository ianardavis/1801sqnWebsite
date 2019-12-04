const fn = {},
      m  = require('./models'),
      op = require('sequelize').Op
      cn = require('./constructors'), 
      se = require("sequelize"),
      fs = require('fs'),
      excel  = require('exceljs'),
      http   = require('http'),
      PDFDoc = require('pdfkit');
var currentLine,
    supplier_id,
    demand_id;

fn.allowed = (permission, redirectIfDenied, req, res, cb) => {
    fn.getOne(
        m.permissions,
        {user_id: req.user.user_id},
        [],
        [permission]
    )
    .then(allowed => {
        if (allowed[permission]) {
            cb(true);
        } else {
            if (redirectIfDenied) {
                req.flash('danger', 'Permission denied!');
                res.redirect('back');
            } else {
                cb(false);
            };
        };
    })
    .catch(err => {
        console.log(err);
        if (redirectIfDenied) {
            req.flash('danger', 'Permission denied!');
            res.redirect('back');
        } else {
            cb(false);
        };
    });
    return null;
}; //OK
fn.getPermissions = user_id => {
    return new Promise((resolve, reject) => {
        fn.getOne(
            m.permissions,
            {user_id: user_id},
            [],
            {exclude: ['createdAt', 'updatedAt', 'user_id']}
        )
        .then(permissions => {
            resolve(permissions);
        })
        .catch(err => {
            reject(err);
        });
    });
};
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
fn.getOne = (table, where, include = [], attributes = null, nullOK = false) => {
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
                if (nullOK === false) {
                    reject(new Error(fn.singularise(table.tableName, true) + ' not found'));
                } else {
                    resolve(null);
                };
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
            try {
                if (err.parent && err.parent.code === 'ER_DUP_ENTRY') {
                    reject(new Error(err.parent.sqlMessage))
                } else {
                    reject(err);
                };
            } catch(cErr) {
                reject(cErr);
            };
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
                reject(new Error('No ' + table.tableName + ' deleted'))
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
fn.stock = as => {
    return {model: m.stock, as: as, include: [m.locations]};
} ;
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
                fn.stock('issueStock'),
                fn.stock('returnStock')
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
        var requests    = [],
            issues      = [],
            orders      = [],
            request_IDs = [];
        req.body.approves.forEach(line => {
            if (line && line !== '') {
                line = JSON.parse(line);
                if (line._action === 'Issue') {
                    if (!req.body.nsns || !req.body.nsns['line' + line.line_id]) {
                        req.flash('danger', 'Can not issue line ' + line.line_id + ', no NSNs available');
                    } else {
                        line.nsn_id = Number(req.body.nsns['line' + line.line_id]);
                        if (!request_IDs.includes(line.request_id)) request_IDs.push(line.request_id);
                        issues.push(line);
                    };
                } else if (line._action === 'Order') {
                    if (!request_IDs.includes(line.request_id)) request_IDs.push(line.request_id);
                    orders.push(line);
                };
            };
        });
        if (issues.length > 0) {
            requests.push(fn.processRequestIssues(issues, req));
            // requests.push(fn.issueItems(
            //     {issued_to: req.body.requested_for, _date: Date.now(), _date_due: fn.addYears(7)}, 
            //     issues, 
            //     {_text: 'Generated from request', _system: true}, 
            //     req)
            // );
        };
        if (orders.length > 0) {
            requests.push(fn.processRequestOrders(orders, req));
        };
        requests.push(fn.processRequestDeclines(req));
        Promise.all(
            requests
        )
        .then(results => {
            var check_IDs = Array.from(new Set(results.concat(request_IDs).flat()));
            var checks = [];
            check_IDs.forEach(request_id => {
                checks.push(
                    fn.closeIfNoLines(
                        m.requests,
                        m.requests_l,
                        {request_id: Number(request_id)},
                        {_status: 'Pending'}
                    )
                );
            });
            Promise.all(
                checks
            )
            .then(result => {
                res.redirect('/stores/requests');
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
}; //OK
fn.processRequestIssues = (issues, req) => {
    return new Promise((resolve, reject) => {
        var newIssue = new cn.Issue({issued_to: req.body.requested_for, _date: Date.now(), _date_due: fn.addYears(7)}, req.user.user_id),
            actions = [],
            request_IDs = [];
        fn.create(
            m.issues,
            newIssue
        )
        .then(issue => {
            var issue_line = fn.counter();
            var newNote = new cn.Note('issues', issue.issue_id, 'Generated from request', true, req.user.user_id);
            actions.push(fn.create(m.notes, newNote));
            issues.forEach(line => {
                if (!request_IDs.includes(line.request_id)) request_IDs.push(line.request_id);
                var requestStatus = new cn.RequestStatus(line, req.user.user_id),
                    newLine       = new cn.IssueLine(issue.issue_id, line, issue_line());
                requestStatus.issue_id = issue.issue_id
                actions.push(fn.update(m.requests_l, requestStatus, {line_id: line.line_id}));
                actions.push(fn.create(m.issues_l, newLine));
                actions.push(fn.subtractStock(line.stock_id, line.qty));
            });
            if (issue_line() === 1) {
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
            Promise.all(
                actions
            )
            .then(results => {
                resolve(request_IDs);
            })
            .catch(err => {
                reject(err);
            });
        })
        .catch(err => {
            console.log(err);
            req.flash('danger', err.message);
            reject(err);
        });
    });
}; //OK
fn.processRequestOrders = (orders, req) => {
    return new Promise((resolve, reject) => {
        try {
            
            var newOrder = new cn.Order(req.body.requested_for, req.user.user_id),
                order_line = fn.counter(),
                actions = [],
                request_IDs = [];
            fn.create(
                m.orders,
                newOrder
            )                    
            .then(order => {
                var newNote = new cn.Note('orders', order.order_id, 'Generated from request', true, req.user.user_id);
                actions.push(fn.create(m.notes, newNote));
                orders.forEach(line => {
                    if (!request_IDs.includes(line.request_id)) request_IDs.push(line.request_id);
                    var requestStatus = new cn.RequestStatus(line, req.user.user_id),
                        newline = new cn.OrderLine(order.order_id, line);
                    requestStatus.order_id = order.order_id;
                    actions.push(fn.create(m.orders_l, newline));
                    actions.push(fn.update(m.requests_l, requestStatus, {line_id: line.line_id}));
                    order_line();
                });
                if (order_line() === 1) {
                    fn.delete(
                        m.orders, 
                        {order_id: order.order_id}
                    )
                    .then(result => {
                        req.flash('info', 'No lines, order deleted');
                    })
                    .catch(err => {
                        console.log(err);
                        req.flash('danger', 'No lines, error order');
                    });
                };
                Promise.all(
                    actions
                )
                .then(results => {
                    resolve(request_IDs);
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
            })
            .catch(err => {
                req.flash('danger', err.message);
                console.log(err);
                reject(err);
            });
        } catch(err) {
            req.flash('danger', err.message);
            console.log(err);
            reject(err);
        };
    });
}; //OK
fn.processRequestDeclines = req => {
    return new Promise((resolve, reject) => {
        var actions = [],
            request_IDs = [];
        req.body.declines.forEach(line => {
            if (line !== 'pending' && line !== 'approved') {
                line = JSON.parse(line);
                if (line._status === 'Declined') {
                    if (!request_IDs.includes(line.request_id)) request_IDs.push(line.request_id);
                    var requestStatus = new cn.RequestStatus({_status: 'Declined', _action: null}, req.user.user_id);
                    actions.push(fn.update(m.requests_l, requestStatus, {line_id: line.line_id}));
                };
            };
        });
        Promise.all(
            actions
        )
        .then(results => {
            resolve(request_IDs);
        })
        .catch(err => {
            console.log(err);
            reject(err);
        });
    });
}
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
                if (item.demandLine) {
                    actions.push(fn.receiveDemandLine(newLine, item.demandLine));
                } else {
                    actions.push(fn.create(m.receipts_l, newLine));
                };
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
}; //OK
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
        fn.getOne(
            table_l,
            {
                ...id, 
                ...where
            },
            null,
            null,
            true
        )
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
                if (order.item_size._demand_page === null || order.item_size._demand_page === '') {
                    rejects.push({line_id: order.line_id, reason: 'page'});
                } else if (order.item_size._demand_cell === null || order.item_size._demand_cell === '') {
                    rejects.push({line_id: order.line_id, reason: 'cell'});
                } else {
                    var existing = orders.findIndex(e => e.itemsize_id === order.itemsize_id);
                    if (existing === -1) {
                        orders.push({
                            lines:       [order.line_id],
                            itemsize_id: order.itemsize_id,
                            page:        order.item_size._demand_page, 
                            cell:        order.item_size._demand_cell, 
                            qty:         order._qty
                        });
                    } else {
                        orders[existing].qty += order._qty
                        orders[existing].lines.push(order.line_id);
                    };
                    if (order.order.ordered_for !== -1) {
                        var user = {
                            rank: order.order.orderedFor.rank._rank, 
                            name: order.order.orderedFor._name, 
                            bader: order.order.orderedFor._bader
                        };
                        if (!users.some(e => e.bader === user.bader)) {
                        users.push(user);
                        };
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
        fn.getOne(
            m.suppliers,
            {supplier_id: supplier_id},
            [m.files]
        )
        .then(supplier => {
            if (supplier) {
                if (supplier.file._path) {
                    var path       = process.env.ROOT + '/public/res/',
                        newDemand  = 'demands/' + fn.timestamp() + ' demand - ' + supplier._name + '.xlsx',
                        demandFile = path + 'file/' + supplier.file._path;
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
            fn.getOne(
                m.suppliers,
                {supplier_id: supplier_id},
                [m.files, m.inventories]
            )
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
            Promise.all(
                demandLines
            )
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
fn.processDemandLine = line => {
    return new Promise((resolve, reject) => {
        fn.getOne(
            m.demands_l,
            {line_id: line.line_id},
            [m.demands]
        )
        .then(demands_l => {
            if (supplier_id === null) {
                supplier_id = demands_l.demand.supplier_id;
            } else if (supplier_id !== demands_l.demand.supplier_id){
                reject(new Error('Demand contains lines from different suppliers'));
            };
            if (demand_id === null) {
                demand_id = demands_l.demand_id;
            } else if (demand_id !== demands_l.demand_id){
                reject(new Error('Demand contains lines from different demands'));
            };
            resolve({stock_id: line.stock_id, qty: demands_l._qty, demandLine: line.line_id, });
        })
        .catch(err => {
            console.log(err);
            reject(line.line_id);
        });
    });
};
fn.receiveDemandLines = (lines, req) => {
    return new Promise((resolve, reject) => {
        var actions = [];
        supplier_id = null;
        demand_id = null;
        lines.forEach(line => {
            actions.push(fn.processDemandLine(JSON.parse(line)))
        });
        Promise.all(
            actions
        )
        .then(items => {
            if (!supplier_id) {
                reject(new Error('No supplier specified'));
            } else if (!items) {
                reject(new Error('No lines selected'));
            } else {
                fn.receiveStock(
                    items, 
                    supplier_id, 
                    req.user.user_id
                )
                .then(receipt_id => {
                    fn.closeIfNoLines(
                        m.demands,
                        m.demands_l,
                        {demand_id: demand_id},
                        {_status: 'Pending'}
                    )
                    .then(result => {
                        if (result[0] === 1) req.flash('info', 'Demand closed');
                        fn.getAllWhere(
                            m.orders_l,
                            {
                                demand_line_id: {[op.not]: null},
                                issue_line_id: null,
                            },
                            [
                                {
                                    model: m.orders,
                                    where: {ordered_for: -1}
                                }
                            ]
                        )
                        .then(orders_l => {
                            var orderActions = [],
                                orders = [];
                            orders_l.forEach(line => {
                                orderActions.push(fn.update(m.orders_l, {issue_line_id: -1}, {line_id: line.line_id}));
                                if (!orders.includes(line.order.order_id)) orders.push(line.order.order_id);
                            })
                            Promise.all(
                                orderActions
                            )
                            .then(results => {
                                orders.forEach(order_id => {
                                    fn.closeIfNoLines(
                                        m.orders,
                                        m.orders_l,
                                        {order_id: order_id},
                                        {issue_line_id: null}
                                    )
                                    .then(results => {
                                        resolve(true);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                                });
                            })
                            .catch(err => {
                                reject(err);
                            });
                        })
                        .catch(err => {
                            reject(err);
                        });
                    })
                    .catch(err => {
                        reject(err);
                    });
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
fn.receiveDemandLine = (receiptLine, line_id) => {
    return new Promise((resolve, reject) => {
        fn.create(
            m.receipts_l,
            receiptLine
        )
        .then(receipts_l => {
            fn.update(
                m.orders_l,
                {receipt_line_id: receipts_l.line_id},
                {demand_line_id: Number(line_id)}
            )
            .then(result => {
                fn.update(
                    m.demands_l,
                    {_status: 'Received'},
                    {line_id: Number(line_id)}
                )
                .then(result => {
                    resolve(receipts_l.line_id);
                })
                .catch(err => {
                    reject(err);
                });
            })
            .catch(err => {
                reject(err);
            })
        })
        .catch(err => {
            reject(err);
        })
    });
}; //OK

fn.downloadFile = (file, res) => {
    res.download(file, file, err => {
        if (err) {
            console.log(err);
            req.flash('danger', err.message);
        };
    });
}; //OK
fn.createLoanCard = issue_id => {
    return new Promise((resolve, reject) => {
        fn.getOne(
            m.issues, 
            {issue_id: issue_id}, 
            fn.issuesInclude(true)
        )
        .then(issue => {
            try {
                var docMetadata = {},
                    file = process.env.ROOT + '/public/res/loancards/Issue ' + issue.issue_id + ' - ' + issue.issuedTo._name + '.pdf',
                    writeStream = fs.createWriteStream(file);
                docMetadata.Title         = 'Loan Card - Issue: ' + issue.issue_id;
                docMetadata.Author        = issue.issuedBy.rank._rank + ' ' + issue.issuedBy._name + ', ' + issue.issuedBy._ini;
                docMetadata.autoFirstPage = false;
                docMetadata.bufferPages   = true;
                const doc = new PDFDoc(docMetadata);

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
                        {_filename: file},
                        {issue_id: issue_id}
                    )
                    .then(result => {
                        resolve(file);
                    })
                    .catch(err => {
                        reject(err);
                    });
                })
            } catch(err) {
                reject(err);
            }
        })
        .catch(err => {
            reject(err);
        });
    });
};
fn.addPage = doc => {
    var pageMetaData = {};
    pageMetaData.size    = 'A4';
    pageMetaData.margins = 28;
    doc.addPage(pageMetaData);    
} ;
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
            .text('Rank: ' + issue.issuedTo.rank._rank, 28, 175)
            .text('Surname: ' + issue.issuedTo._name, 150, 175)
            .text('Initials: ' + issue.issuedTo._ini, 415, 175)
            .text('Bader/Service #: ' + issue.issuedTo._bader, 28, 195)
            .text('Date: ' + issue._date.toDateString(), 415, 195)
            .moveTo(28, 220).lineTo(567.28, 220).stroke();
    } catch(err) {
        console.log(err);
    };
};
fn.drawIssues = (doc, issue) => {
    try{
        var lineHeight = 250;
        issue.lines.forEach(line => {
            if (lineHeight >= 761.89) {
                doc
                    .text('END OF PAGE', 268, lineHeight)
                    .addPage();
                fn.drawHeader(doc, issue);
            };
            doc
                .text(line.nsn._nsn, 28, lineHeight)
                .text(line.item_size.item._description, 123.81, lineHeight)
                .text(line.item_size.size._text, 276.31, lineHeight)
                .text(line._qty, 373.56, lineHeight)
                .moveTo(28, lineHeight + 15).lineTo(567.28, lineHeight + 15).stroke();
            lineHeight += 20;
        });
        var close_text = 'END OF ISSUE, ' + issue.lines.length + ' LINES ISSUED';
        doc
            .text(close_text, 297.64 - (doc.widthOfString(close_text) / 2), lineHeight)
            .moveTo(116.81, 220).lineTo(116.81, lineHeight - 5).stroke()
            .moveTo(269.31, 220).lineTo(269.31, lineHeight - 5).stroke()
            .moveTo(366.56, 220).lineTo(366.56, lineHeight - 5).stroke()
            .moveTo(397.21, 220).lineTo(397.21, lineHeight - 5).stroke()
            .moveTo(116.81, 220).lineTo(116.81, lineHeight - 5).stroke()
            .moveTo(492.745, 220).lineTo(492.745, lineHeight - 5).stroke();
        lineHeight += 20;
        var disclaimer = 'By signing below, I confirm I have received the items listed above. I understand I am responsible for any items issued to me and that I may be liable to pay for items lost or damaged through negligence';
        doc
            .text(disclaimer, 28, lineHeight, {width: 539.28, align: 'center'})
            .rect(197.64, lineHeight += 60, 200, 100).stroke();
    } catch(err) {
        console.log(err);
    }
};
fn.addPageNumbers = (doc, issue_id) => {
    const range = doc.bufferedPageRange();
    doc.fontSize(15);
    for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
        doc.switchToPage(i)
        doc
            .text(`Page ${i + 1} of ${range.count}`, 28, 803.89)
            .text('Issue ID: ' + issue_id, (567.28 - doc.widthOfString('Issue ID: ' + issue_id)), 803.89)
            .text(`Page ${i + 1} of ${range.count}`, 28, 28)
            .text('Issue ID: ' + issue_id, (567.28 - doc.widthOfString('Issue ID: ' + issue_id)), 28);
      }
};

fn.issueItems = (issueDetails, items, issueNote = null, req) => {
    return new Promise((resolve, reject) => {
        if (items && items.length > 0) {
            var newIssue = new cn.Issue(issueDetails, req.user.user_id);
            fn.create(
                m.issues,
                newIssue
            )
            .then(issue => {
                var actions = [];
                if (issueNote) {
                    var newNote = new cn.Note('issues', issue.issue_id, issueNote._text, issueNote._system, req.user.user_id);
                    actions.push(fn.create(m.notes, newNote));
                };
                currentLine = fn.counter();
                items.forEach(item => {
                    if (item) {
                        if (typeof(item) !== 'object') item = JSON.parse(item);
                        var line = new cn.IssueLine(issue.issue_id, item, currentLine());
                        actions.push(fn.subtractStock(item.stock_id, item._qty));
                        actions.push(fn.create(m.issues_l, line));
                        if (item.request_line_id) {
                            var requestStatus = new cn.RequestStatus(line, req.user.user_id);
                            requestStatus.issue_id = issue.issue_id;
                            actions.push(fn.update(m.requests_l, requestStatus, {line_id: item.request_line_id}));
                        };
                    };
                });
                Promise.all(
                    actions
                )
                .then(results => {
                    if (currentLine() === 1) {
                        fn.delete(m.issues, {issue_id: issue.issue_id}, req, next => {
                            reject(new Error('No lines on issue, issue deleted'));
                        });
                    } else {
                        fn.createLoanCard(
                            issue.issue_id
                        )
                        .then(result => {
                            resolve( issue.issue_id);
                        })
                        .catch(err => {
                            reject(err);
                        });
                        
                    };
                })
                .catch(err => {
                    reject(err);
                });
            })
            .catch(err => {
                reject(err);
            });
        } else {
            reject(new Error('No items selected'));
        };
    });
};
module.exports = fn;