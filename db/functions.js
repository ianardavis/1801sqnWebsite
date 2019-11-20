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
};
fn.getAllWhere = (table, where, req, cb) => {
    var singular = fn.singularise(table.tableName);
    table.findAll(
        {where: where})
    .then(results => {
        if (results) {
            cb(results);
        } else {
            req.flash('info', singular + ' not found');
            cb(null);
        };
        return null})
    .catch(err => {
        req.flash('danger', 'Error searching ' + table.tableName)
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getAll = (table, req, warn, cb) => {
    table.findAll()
    .then(results => {
        if (warn) if (!results) req.flash('info', fn.singularise(table.tableName) + ' not found');
        cb(results);
        return null;})
    .catch(err => {
        req.flash('danger', 'Error searching ' + table)
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getOne = (table, where, req, cb) => {
    table.findOne(
        {where: where})
    .then(results => {
        cb(results);
        return null;})
    .catch(err => {
        req.flash('danger', 'Error searching in ' + table)
        console.log(err);
        cb(null);
        return null;
    });
};
fn.create = (table, record, req, cb) => {
    table.create(record)
    .then(record => {
        req.flash('success', fn.singularise(table.tableName, true) + ' added');
        cb(record);
        return null;})
    .catch(err => {
        req.flash('danger', 'Error adding new ' + fn.singularise(table.tableName))
        console.log(err);
        cb(null);
        return null;
    });
};
fn.update = (table, record, where, req, cb) => {
    var singular = fn.singularise(table.tableName);
    table.update(
        record,
        {where: where})
    .then(result => {
        if (result) {
            req.flash('success', singular + ' edited!');
            cb(true);
        } else {
            req.flash('danger', singular + ' NOT edited!');
            cb(false);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error editing ' + singular);
        console.log(err);
        cb(false);
        return null;
    });
};
fn.delete = (table, where, req, cb) => {
    var singular = fn.singularise(table.tableName);
    table.destroy(
        {where: where})
    .then(result => {
        if (result) {
            req.flash('success', singular + ' deleted');
        } else {
            req.flash('danger', singular + ' NOT deleted');
        }
        cb(Boolean(result));
        return null;})
    .catch(err => {
        req.flash('danger', 'Error deleting ' + singular);
        console.log(err);
        cb(false);
        return null;
    });
};
fn.singularise = (str, capitalise = false) => {
    var string = se.Utils.singularize(str);
    if (capitalise) {
        string = string.substring(0, 1).toUpperCase() + string.substring(1, string.length);
    };
    return string;
};
fn.processPromiseResult = (results, req, cb) => {
    var danger  = [],
        success = [],
        info    = [],
        errors  = [];
    results.forEach(result => {
        if (result !== 'null') {
            if (result.flash_type === 'danger') {
                danger.push(result.flash_message);
            } else if (result.flash_type === 'success') {
                if (result.flash_message) {
                    success.push(result.flash_message);
                };
            } else if (result.flash_type === 'info') {
                if (result.flash_message) {
                    info.push(result.flash_message);
                };
            };
            if (result.error !== null) {
                errors.push(result.error);
            };
        };
    });
    fn.addFlash(req, 'danger', danger);
    fn.addFlash(req, 'success', success);
    fn.addFlash(req, 'info', info);
    if (errors.length !== 0) {
        errors.forEach(err => {
            console.log(err);
        });
    };
    cb(true);
};
fn.addFlash = (req, type, arr) => {
    if (arr.length !== 0) {
        arr.map(element => {
            req.flash(type, element);
        });
    };
};

fn.summer = items => {
    if (items == null) {
        return 0;
    }
    return items.reduce((a, b) => {
        return b['_qty'] == null ? a : a + b['_qty'];
    }, 0);
};
fn.counter = () => {
    var count = 0;
    return function() {
        return ++count;
    };
};
fn.addYears = (addYears = 0) => {
    var newDate = new Date();
    var dd = String(newDate.getDate()).padStart(2, '0');
    var MM = String(newDate.getMonth() + 1).padStart(2, '0');
    var yyyy = newDate.getFullYear() + addYears;

    newDate = yyyy + '-' + MM + '-' + dd;
    return newDate;
};

fn.item_sizes = (locations = false, items = true, nsns = false, as = 'size') => {
    var includes = [m.sizes];
    if (locations) {includes.push(m.locations)};
    if (items) {includes.push(m.items)};
    if (nsns) {includes.push(m.nsns)};
    return {model: m.item_sizes, as: as, include: includes};
};
fn.users = (as) => {
    return {model: m.users, as: as, include: [m.ranks]};
};

fn.getOptions = (options, req, cb) => {
    var gets = [];
    options.map(option => {
        gets.push(
            new Promise((resolve, reject) => {
                m[option.table].findAll({
                    include: option.include || []
                }).then(results => {
                    resolve({table: option.table, success: true, result: results});
                    return null;
                }).catch(err => {
                    console.log(err);
                    reject({table: option.table, success: false, result: err});
                    return null;
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
};
fn.updateLocationQty = (location_id, qty, action) => {
    return new Promise((resolve, reject) => {
        m.locations.findOne(
            {where: {location_id: location_id}})
        .then(location => {
            if (location) {
                var _qty = location._qty;
                if (action === '+') {
                    _qty = location._qty + qty
                } else if (action === '-') {
                    _qty = location._qty - qty
                } else if (action === '=') {
                    _qty = qty
                } else {
                    reject({flash_type: 'danger', flash_message: 'No action specified!', error: null});
                }
                m.locations.update(
                    {_qty: _qty},
                    {where: {location_id: location_id}})
                .then(result => {
                    if (result) {
                        resolve({flash_type: 'success', flash_message: 'Location Updated: ' + location._location, error: null});
                    } else {
                        reject({flash_type: 'danger', flash_message: 'Error Updating Location: ' + location._location, error: null});
                    }})
                .catch(err => {
                    reject({flash_type: 'danger', flash_message: 'Error Updating Location: ' + location._location, error: err});
                });
            } else {
                reject({flash_type: 'danger', flash_message: 'Error Getting Location: ' + location_id, error: null});
            };})
        .catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error Getting Location: ' + location_id, error: err});
        });
    });
};

fn.getAllUsersWhere = (where, req, cb) => {
    m.users.findAll(
        {where: where,
        include: [
            m.ranks, 
            m.statuses
        ]})
    .then(users => {
        if (users) {
            cb(users);
        } else {
            req.flash('info', 'No Users Found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error finding users!');
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getUser = (user_id, extended, req, cb) => {
    var include = [
        m.ranks, 
        m.genders, 
        m.statuses, 
        m.permissions
    ];
    if (extended.include) {
        include.push({
            model: m.orders,
            include: [fn.users('orderedBy')],
            required: false
        },{
            model: m.issues,
            include: [fn.users('issuedBy')],
            required: false
        },{
            model: m.requests,
            include: [fn.users('requestedBy')],
            required: false
        });
    }
    m.users.findOne(
        {where: {user_id: user_id},
        include: include})
    .then(user => {
        if (user) {
            cb(user);
        } else {
            req.flash('danger', 'User not found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error Getting User!');
        console.log(err);
        cb(null);
        return null;
    });
};

fn.issuesInclude = (includeLines) => {
    var include = [
        fn.users('issuedTo'),
        fn.users('issuedBy')];
    if (includeLines) {
        include.push({
            model: m.issues_l,
            as: 'lines',
            include: [
                m.nsns,
                fn.users('returnedTo'),
                fn.item_sizes(true, true),
                {
                    model: m.locations,
                    as:    'issueLocation'
                },{
                    model: m.locations,
                    as:    'returnLocation'
                }
            ]
        });
    };
    return include;
};
fn.getAllIssues = (query, includeLines, req, cb) => {
    var where = {},
        include = fn.issuesInclude(includeLines);
    if (query.ci === 2) {
        where._complete = 0;
    } else if (query.ci === 3) {
        where._complete = 1;
    };
    
    m.issues.findAll(
        {where: where,
        include: include})
    .then(issues => {
        if (!issues) req.flash('info', 'No issues found!');
        cb(issues);
        return null;})
    .catch(err => {
        req.flash('danger', 'Error searching issues')
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getIssue = (issue_id, includeLines, req, cb) => {
    var include = fn.issuesInclude(includeLines);
    m.issues.findOne(
        {where: {issue_id: issue_id},
        include: include})
    .then(issue => {
        if (!issue) req.flash('danger', 'Issue not found!');
        cb(issue);
        return null;})
    .catch(err => {
        req.flash('danger', 'Error searching issues');
        console.log(err);
        cb(null);
        return null;
    });
};

fn.getItem = (item_id, includeSizes, req, cb) => {
    var include = [
        m.genders, 
        m.categories, 
        m.groups, 
        m.types, 
        m.subtypes, 
    ];
    if (includeSizes) include.push(fn.item_sizes(true, false, false, 'sizes'));
    m.items.findOne(
        {where: {item_id: item_id},
        include: include})
    .then(item => {
        if (item) {
            cb(item)
        } else {
            req.flash('danger', 'Item not found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        console.log(err);
        req.flash('danger', 'Error Getting Item!');
        cb(null);
        return null;
    });
};

fn.getItemSize = (stock_id, req, nsns, locations, issues, orders, requests, cb) => {
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
                fn.users('returnedTo'),
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
    if (nsns.include)      include.push({model: m.nsns});
    if (locations.include) include.push({model: m.locations});
    m.item_sizes.findOne(
        {where: {stock_id: stock_id},
        include: include})
    .then(item => {
        if (item) {
            cb(item);
        } else {
            req.flash('danger', 'Size not found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error finding size!')
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getAllItemSizesWhere = (where, req, cb) => {
    m.item_sizes.findAll(
        {where: where,
        include: [m.sizes]})
    .then(sizes => {
        if (sizes) {
            cb(sizes);
        } else {
            req.flash('info', 'No sizes found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error getting sizes!')
        console.log(err);
        cb(null);
        return null;
    });
};
fn.addSize = (size_id, req) => {
    return new Promise((resolve, reject) => {
        fn.getOne(
            m.item_sizes, 
            {
                item_id: req.body.details.item_id,
                size_id: size_id}, 
            req, 
            size => {
                if (size) {
                    req.flash('info', 'A selected size is already assigned: ' + size_id);
                    reject('A selected size is already assigned: ' + size_id);
                } else {
                    req.body.details.size_id = size_id;
                    fn.create(m.item_sizes, req.body.details, req, size => {
                        if (size) {
                            resolve(size);
                        } else {
                            reject('Error adding size: ' + size_id);
                        };
                    });
                };
            }
        );
    });
};

fn.getNSN = (nsn_id, req, cb) => {
    m.nsns.findOne(
        {where: {nsn_id: nsn_id},
        include: [fn.item_sizes(false, true)]})
    .then(nsn => {
        if (nsn) {
            cb(nsn);
        } else {
            req.flash('danger', 'NSN not found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error finding NSN!');
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getLocation = (location_id, req, cb) => {
    m.locations.findOne(
        {where: {location_id: location_id},
        include: [fn.item_sizes(false, true)]})
    .then(location => {
        if (location) {
            cb(location);
        } else {
            req.flash('danger', 'Error finding location!');
            console.log(err);
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error finding location!');
        console.log(err);
        cb(null);
        return null;
    });
};

fn.getNotes = (table, id, req, res, cb) => {
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
            m.notes.findAll(
                {where: whereObj})
            .then(notes => {
                cb(notes);
                return null;})
            .catch(err => {
                req.flash('danger', 'Error searching notes')
                console.log(err);
                cb(null);
                return null;
            });
        } else {
            cb(null);
        };
    });
};
fn.addNote = (note) => {
    return new Promise((resolve, reject) => {
        m.notes.create(note)
        .then(newNote => {
            resolve({flash_type: 'success', flash_message: 'Note Added, ID: ' + newNote.note_id, error: null});
        })
        .catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error adding note!', error: err});
        });
    });
};

fn.processRequests = async function (req, res) {
    if (req.body.approves || req.body.declines) {
        var requests = [],
            issues   = [],
            orders   = [];
        req.body.approves.map(line => {
            if (line !== '') {
                line = JSON.parse(line);
                if (line) {
                    if (line._action === 'Issue') {
                        issues.push(line);
                    } else if (line._action === 'Order') {
                        orders.push(line);
                    };
                };
            };
        });
        if (issues.length > 0) {
            var newIssue = new cn.Issue({issued_to: req.body.requested_for, _date: Date.now(), _date_due: fn.addYears(7)}, req.user.user_id)
            let issue    = await fn.create_p(m.issues, newIssue, req);
            if (issue) {
                currentLine = fn.counter();
                var newNote = new cn.Note('issues', issue.issue_id, 'Generated from request: ' + req.params.id, true, req.user.user_id);
                requests.push(fn.addNote(newNote));
                issues.map(line => {
                    if ((!req.body.nsns) || (!req.body.nsns['line_' + line.line_id])) {
                        req.flash('danger', 'Can not issue line ' + line.line_id + ', No NSNs available');
                    } else {
                        line.nsn_id = Number(req.body.nsns['line_' + line.line_id]);
                        var requestStatus = new cn.RequestStatus(line, req.user.user_id),
                            newLine       = new cn.IssueLine(issue.issue_id, line, currentLine());
                        requestStatus.issue_id = issue.issue_id
                        requests.push(fn.updateRequestStatus(line.line_id, requestStatus));
                        requests.push(fn.issueLine(newLine));
                        requests.push(fn.updateLocationQty(line.location_id, line.qty, '-'));
                    }
                });
                if (currentLine() === 1) {
                    delete(m.issues, {issue_id: issue.issue_id}, req, result => {});
                };
            } else {
                req.flash('danger', 'Issue not created');
            };
        };
        if (orders.length > 0) {
            try {
                var newOrder = new cn.Order(req.body.requested_for, req.user.user_id);
                let order    = await fn.create_p(m.orders, newOrder, req);
                if (order) {
                    var newNote = new cn.Note('orders', order.order_id, 'Generated from request: ' + req.params.id, true, req.user.user_id);
                    requests.push(fn.addNote(newNote));
                    orders.map(line => {
                        var requestStatus = new cn.RequestStatus(line, req.user.user_id),
                            newline = new cn.OrderLine(order.order_id, line);
                        requestStatus.order_id = order.order_id;
                        requests.push(fn.orderLine(newline));
                        requests.push(fn.updateRequestStatus(line.line_id, requestStatus));
                    });
                } else {
                    req.flash('danger', 'Order not created');
                };
            } catch(err) {
                req.flash('danger', 'Error creating order/lines')
                console.log(err);
            };
        };
        req.body.declines.map(line => {
            if (line !== 'pending' && line !== 'approved') {
                line = JSON.parse(line);
                if (line._status === 'Declined') {
                    var requestStatus = new cn.RequestStatus(SVGPathSegLinetoVerticalRel, req.user.user_id);
                    requests.push(fn.updateRequestStatus(line.line_id, requestStatus));
                    requests.push(fn.addNote('requests', line.request_id, 'Request declined', true, req.user.user_id));
                };
            };
        });
        
        Promise.all(requests)
        .then(results => {
            fn.closeRequestIfAllIssued(req.params.id)
            .then(close_results => {
                fn.processPromiseResult(results.concat(close_results), req, then => {
                    res.redirect('/stores/requests/' + req.params.id);
                })
            })
            .catch(err => {
                console.log(err);
                res.redirect('/stores/requests');
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/stores/requests');
        });
    } else {
        req.flash('info', 'No requests selected!');
        res.redirect('/stores/requests');
    };
};
fn.create_p = (table, record, req) => {
    return new Promise((resolve, reject) => {
        table.create(record)
        .then(record => {
            req.flash('success', fn.singularise(table.tableName, true) + ' added');
            resolve(record);
        })
        .catch(err => {
            req.flash('danger', 'Error adding new ' + fn.singularise(table.tableName));
           reject(null);
        });
    });
}
fn.issueLine = (newIssue) => {
    return new Promise((resolve, reject) => {
        m.issues_l.create(newIssue)
        .then(issue => {
            resolve({flash_type: 'success', flash_message: 'Issue created, ID: ' + issue.issue_id, error: null});
        })
        .catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error creating issue!', error: err});
        });
    });
};
fn.orderLine = (order) => {
    return new Promise((resolve, reject) => {
        m.orders_l.create(order)
        .then(newOrder => {
            resolve({flash_type: 'success', flash_message: 'Order line added, ID: ' + newOrder.order_id, error: null});
        }).catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error adding line!', error: err});
        });
    });
};
fn.receiveLine = (receipt, location) => {
    return new Promise((resolve, reject) => {
        m.locations.update(
            {_qty: location._qty},
            {where: {location_id: location.location_id}})
        .then(result => {
            if (result) {
                m.receipts_l.create(receipt)
                .then(newReceipt => {
                    resolve({flash_type: 'success', flash_message: 'Receipt created, Id: ' + newReceipt.receipt_id, error: null});
                }).catch(err => {
                    reject({flash_type: 'danger', flash_message: 'Error creating receipt!', error: err});
                });
            } else {
                reject({flash_type: 'danger', flash_message: 'Error updating location!', error: null});
            };
        }).catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error updating location!', error: err});
        });
    });
};
fn.requestLine = (request) => {
    return new Promise((resolve, reject) => {
        m.requests_l.create(request)
        .then(newRequest => {
            resolve({flash_type: 'success', flash_message: 'line added, ID: ' + newRequest.request_id, error: null});
        })
        .catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error adding line!', error: err});
        });
    });
};
fn.returnLine = (line, user_id) => {
    return new Promise((resolve, reject) => {
        var returned = new cn.Returned(user_id, line.location_id);
        m.issues_l.findOne(
            {where: {line_id: line.line_id},
            include: [m.issues]})
        .then(issue => {
            if (Number(issue.issue.issued_to) !== Number(user_id)) {
                m.issues_l.update(
                    returned,
                    {where: {line_id: line.line_id}})
                .then(result => {
                    if (result) {
                        resolve({flash_type: 'success', flash_message: 'Line Returned: ' + line.line_id, error: null});
                    } else {
                        reject({flash_type: 'danger', flash_message: 'Error Returning Line: ' + line.line_id, error: null});
                    };})
                .catch(err => {
                    reject({flash_type: 'danger', flash_message: 'Error Updating Line: ' + line.line_id, error: err});
                });
            } else {
                reject({flash_type: 'danger', flash_message: 'You cannot return items issued to yourself: ' + line.line_id, error: null});
            };})
        .catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error Getting Line: ' + line.line_id, error: err});
        });
    });
};
fn.closeRequestIfAllIssued = (request_id) => {
    return new Promise((resolve, reject) => {
        m.requests_l.findOne(
            {where: {
                request_id: request_id, 
                _status: 'Pending'}
            })
        .then(result => {
            if (!result) {
                m.requests.update(
                    {_complete: true}, {where: {request_id: request_id}})
                .then(result => {
                    if (result) {
                        resolve({flash_type: 'success', flash_message: 'Request closed: ' + request_id, error: null});
                    } else {
                        reject({flash_type: 'danger', flash_message: 'Error closing request: ' + request_id, error: err});
                    };
                })
                .catch(err => {
                    reject({flash_type: 'danger', flash_message: 'Error closing request: ' + request_id, error: err});
                });
            } else {
                resolve({flash_type: 'success', flash_message: null, error: null});
            };
        })
        .catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error getting lines: ' + request_id, error: err});
        });
    });
};
fn.closeIssueIfAllReturned = (issue_id) => {
    return new Promise((resolve, reject) => {
        m.issues_l.findOne(
            {where: {
                issue_id: issue_id, 
                _date_returned: null}
            })
        .then(result => {
            if (!result) {
                m.issues.update(
                    {_complete: true}, {where: {issue_id: issue_id}})
                .then(result => {
                    resolve({flash_type: 'success', flash_message: 'Issue closed: ' + issue_id, error: null});})
                .catch(err => {
                    reject({flash_type: 'danger', flash_message: 'Error closing issue: ' + issue_id, error: err});
                });
            } else {
                resolve({flash_type: 'success', flash_message: null, error: null});
            };})
        .catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error getting issue: ' + issue_id, error: err});
        });
    });
};
fn.closeOrderIfAllIssued = (order_id) => {
    return new Promise((resolve, reject) => {
        m.orders_l.findOne(
            {where: {
                order_id: order_id, 
                [op.or]: [{demand_id: null}, {receipt_id: null}, {issue_id: null}]}
            })
        .then(result => {
            if (!result) {
                m.orders.update(
                    {_complete: true}, {where: {order_id: order_id}})
                .then(result => {
                    resolve({flash_type: 'success', flash_message: 'Order closed: ' + order_id, error: null});})
                .catch(err => {
                    reject({flash_type: 'danger', flash_message: 'Error closing order: ' + order_id, error: err});
                });
            } else {
                resolve({flash_type: 'success', flash_message: null, error: null});
            };})
        .catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error getting order: ' + order_id, error: err});
        });
    });
};
fn.getAllSuppliers = (req, cb) => {
    m.suppliers.findAll()
    .then(suppliers => {
        if (suppliers) {
            cb(suppliers);
        } else {
            req.flash('info', 'No Suppliers Found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error loading suppliers!')
        console.log(err);
        cb(null);
        return null;
    });
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

fn.getAllOrders = (query, req, cb) => {
    var where = {};
    if (query.co === 2) {
        where._complete = 0;
    } else if (query.co === 3) {
        where._complete = 1;
    };
    m.orders.findAll(
        {where: where,
        include: [
            fn.users('orderedFor'),
            fn.users('orderedBy')
        ]})
    .then(orders => {
        if (orders) {
            cb(orders);
        } else {
            req.flash('info', 'No Orders Found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error getting orders!');
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getOrder = (query, order_id, req, cb) => {
    var where = {};
    if (query.dl === 2) {
        where.demand_id = {[op.is]: null};
    } else if (query.dl === 3) {
        where.demand_id = {[op.not]: null};
    };
    if (query.rl === 2) {
        where.receipt_id = {[op.is]: null};
    } else if (query.rl === 3) {
        where.receipt_id = {[op.not]: null};
    };
    if (query.il === 2) {
        where.issue_id = {[op.is]: null};
    } else if (query.il === 3) {
        where.issue_id = {[op.not]: null};
    };
    m.orders.findOne(
        {where: {order_id: order_id},
        include: [
            {
                model: m.orders_l,
                as:    'lines',
                where: where,
                include: [
                    m.demands,
                    m.receipts,
                    m.issues,
                    fn.item_sizes(false, true)],
                required: false
            },
            fn.users('orderedFor'),
            fn.users('orderedBy')]})
    .then(order => {
        if (order) {
            cb(order);
        } else {
            req.flash('danger', 'Order not found!');
            cb(null);
        };  
        return null;})
    .catch(err => {
        req.flash('danger', 'Error getting Order!');
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getAllDemands = (query, req, cb) => {
    var where = {};
    if (query.cd === 2) {
        where._complete = 1;
    } else if (query.cd === 3) {
        where._complete = 0;
    };
    if (query.su !== 0) {
        where.supplier_id = query.su;
    };
    m.demands.findAll(
        {where: where,
        include: [
            fn.users('user'),
            m.suppliers
        ]})
    .then(demands => {
        if (demands) {
            cb(demands);
        } else {
            req.flash('info', 'No demands found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error getting demands!');
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getDemand = (query, demand_id, req, cb) => {
    var where = {};
    if (query.rl === 2) {
        where.receipt_id = {[op.is]: null};
    } else if (query.rl === 3) {
        where.receipt_id = {[op.not]: null};
    };
    m.demands.findOne(
        {where: {demand_id: demand_id},
        include: [
            fn.users('user'),
            m.suppliers,
            {
                model: m.demands_l,
                as: 'lines',
                include: [,
                    m.demands,
                    fn.item_sizes(false, true),
                    {
                        model: m.receipts,
                        as: 'receipt'
                    }
                ]
            }
        ]})
    .then(demand => {
        if (demand) {
            cb(demand);
        } else {
            req.flash('danger', 'Demand not found!');
            cb(null);
        };  
        return null;})
    .catch(err => {
        req.flash('danger', 'Error getting Demand!');
        console.log(err);
        cb(null);
        return null;
    });
};

fn.getAllReceipts = (req, cb) => {
    m.receipts.findAll(
        {include: [
            fn.users('orderedFor'),
            fn.users('orderedBy')
        ]})
    .then(orders => {
        if (orders) {
            cb(orders);
        } else {
            req.flash('info', 'No Orders Found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error getting orders!');
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getReceipt = (query, order_id, req, cb) => {
    var where = {};
    if (query.po === 2) {
        where.demand_id = null;
    } else if (query.po === 3) {
        where.demand_id = {[op.not]: null};
    };
    if (query.ro === 2) {
        where.receipt_id = null;
    } else if (query.ro === 3) {
        where.receipt_id = {[op.not]: null};
    };
    if (query.io === 2) {
        where.issue_id = null;
    } else if (query.io === 3) {
        where.issue_id = {[op.not]: null};
    };
    m.orders.findOne(
        {where: {order_id: order_id},
        include: [
            {
                model: m.orders_l,
                as: 'lines',
                include: [,
                    m.demands,
                    m.receipts,
                    m.issues,
                    fn.item_sizes(false, true)]
            },
            fn.users('orderedFor'),
            fn.users('orderedBy')
        ]})
    .then(order => {
        if (order) {
            cb(order);
        } else {
            req.flash('danger', 'Order not found!');
            cb(null);
        };  
        return null;})
    .catch(err => {
        req.flash('danger', 'Error getting Order!');
        console.log(err);
        cb(null);
        return null;
    });
};

fn.getAllRequests = (query, req, cb) => {
    var where = {};
    if (query.cr === 2) {
        where._complete = 0;
    } else if (query.cr === 3) {
        where._complete = 1;
    };
    m.requests.findAll(
        {where: where,
        include: [
            {
                model: m.requests_l,
                as: 'lines'
            },
            fn.users('requestedFor'),
            fn.users('requestedBy')
        ]})
    .then(requests => {
        if (requests) {
            cb(requests);
        } else {
            req.flash('info', 'No Requests Found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error getting requests!');
        console.log(err);
        cb(null);
        return null;
    });
};
fn.getRequest = (query, request_id, req, cb) => {
    var where = {};
    if (query.cr === 2) {
        where._status = 'Pending'
    } else if (query.cr === 3) {
        where._status = {[op.not]: 'Pending'}
    };
    m.requests.findOne(
        {where: {request_id: request_id},
        include: [
            {
                model: m.requests_l,
                where: where,
                as: 'lines',
                include: [
                    fn.item_sizes(true, true, true),
                    fn.users('approvedBy'),
                    m.orders,
                    m.issues
                ]
            },
            fn.users('requestedFor'),
            fn.users('requestedBy')
        ]})
    .then(request => {
        if (request) {
            cb(request);
        } else {
            req.flash('danger', 'Request not found!');
            cb(null);
        };
        return null;})
    .catch(err => {
        req.flash('danger', 'Error getting request!');
        console.log(err);
        cb(null);
        return null;
    });
};
fn.updateRequestStatus = (line_id, request) => {
    return new Promise((resolve, reject) => {
        m.requests_l.update(
            request,
            {where: {line_id: line_id}})
        .then(result => {
            if (result) {
                resolve({flash_type: 'success', flash_message: 'Line updated', error: null});
            } else {
                reject({flash_type: 'danger', flash_message: 'Error updating line, ID: ' + line_id, error: null});
            }
        }).catch(err => {
            reject({flash_type: 'danger', flash_message: 'Error updating line, ID: ' + line_id, error: err});
        });
    });
};
fn.booleanToYesNo = (bool = false) => {
    if (bool === true) {
        return 'Yes';
    } else {
        return 'No';
    };
};

fn.getSupplier = (supplier_id, items, file, inventory) => {
    return new Promise((resolve, reject) => {
        var include = []
        if (items) include.push(fn.item_sizes(false, true, false, 'sizes'));
        if (file) include.push(m.files);
        if (inventory) include.push(m.inventories);
        m.suppliers.findOne({
            where: {supplier_id: supplier_id},
            include: include
        })
        .then(supplier => {
            if (supplier) {
                resolve(supplier);
            } else {
                reject(new Error('Supplier not found'));
            };
        })
        .catch(err => {
            reject(err);
        });
    });
};

fn.getUndemandedOrders = supplier_id => {
    return new Promise((resolve, reject) => {
        m.orders_l.findAll({
            where: {demand_id: null},
            include: [{
                model: m.orders,
                include: [{model: m.users, as: 'orderedFor', include: [m.ranks]}]
            },{
                model: m.item_sizes,
                where: {supplier_id: supplier_id},
                as: 'size'
            }]
        })
        .then(orders => {
            resolve(orders);
        })
        .catch(err => {
            reject(err);
        })
    });
};
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
                    if (!orders.some(e => e.stock_id === order.stock_id)) {
                        orders.push({
                            line_id:  order.line_id,
                            stock_id: order.stock_id,
                            page:     order.size._demand_page, 
                            cell:     order.size._demand_cell, 
                            qty:      order._qty
                        });
                    } else {
                        
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
};
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
};
fn.writeItems = (file, orders) => {
    return new Promise((resolve, reject) => {
        var workbook = new excel.Workbook();
        workbook.xlsx.readFile(file)
        .then(() => {
            var success = [],
            fails       = [];
            orders.forEach(order => {
                try {
                    var worksheet = workbook.getWorksheet(order.page),
                        cell = worksheet.getCell(order.cell);
                    cell.value = order.qty;
                    success.push(order.line_id);
                } catch(err) {
                    fails.push({line_id: order.line_id, reason: err.message});
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
};
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
};
module.exports = fn;