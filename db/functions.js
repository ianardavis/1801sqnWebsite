var fn = {},
    m  = require('./models'),
    op = require('sequelize').Op,
    currentLine;
fn.allowed = (permission, redirectIfDenied, req, res, cb) => {
    if (res.locals.permissions[permission]) {
        cb(true);
        return null;
    } else {
        if (redirectIfDenied) {
            req.flash('danger', 'Permission denied!');
            res.redirect('back');
        } else {
            cb(false);
        };
        return null;
    };
}; // All
fn.getAllWhere = (table, where, req, cb) => {
    table.findAll({
        where: where
    }).then((results) => {
        if (results) {
            cb(results);
        } else {
            req.flash('info', 'No ' + table.tableName + ' found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error searching ' + table.tableName)
        console.log(err);
        cb(null);
        return null;
    });
}; // issues: 16 // items: 17
fn.getAll = (table, req, warn, cb) => {
    table.findAll({
    }).then((results) => {
        if (warn) if (!results) req.flash('info', 'No ' + table.tableName + ' found!');
        cb(results);
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error searching ' + table)
        console.log(err);
        cb(null);
        return null;
    });
}; // functions: 87-92 // items: 70
fn.getOne = (table, where, req, cb) => {
    table.findOne({
        where: where
    }).then((results) => {
        cb(results);
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error searching in ' + table)
        console.log(err);
        cb(null);
        return null;
    });
}; // items: 71 // item_locations: 64
fn.create = (table, record, req, cb) => {
    table.create(record)
    .then((record) => {
        if (record) {
            req.flash('success', 'Record added!');
            cb(record);
        } else {
            req.flash('danger', 'Record NOT added!');
            cb(null);
        }
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error adding new record!')
        console.log(err);
        cb(null);
        return null;
    });
}; // items: 36 // item_locations: 9 // item_nsns: 9
fn.update = (table, record, where, req, cb) => {
    table.update(
        record,
        {
            where: where
        }
    ).then((result) => {
        if (result) {
            req.flash('success', 'Item edited!');
            cb(true);
        } else {
            req.flash('danger', 'Item NOT edited!');
            cb(false);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error editing item!');
        console.log(err);
        cb(false);
        return null;
    });
}; // items: 94 // item_locations: 55 // item_nsns: 51 // item_sizes: 102
fn.delete = (table, where, req, cb) => {
    table.destroy({
        where: where
    }).then((result) => {
        if (result) {
            req.flash('success', 'Record deleted from ' + table.tableName);
        } else {
            req.flash('danger', 'Record NOT deleted from ' + table.tableName);
        }
        cb(Boolean(result));
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error deleting from ' + table.tableName);
        console.log(err);
        cb(false);
        return null;
    });
}; // issues: 302 // item_locations: 66
fn.processPromiseResult = (results, req, cb) => {
    var dangerFlash  = [],
        successFlash = [],
        errors       = [];
    results.forEach((result) => {
        if (result !== 'null') {
            if (result.flash_type === 'danger') {
                dangerFlash.push(result.flash_message);
            } else if (result.flash_type === 'success') {
                successFlash.push(result.flash_message);
            };
            if (result.error !== null) {
                errors.push(result.error);
            };
        };
    });
    if (dangerFlash.length !== 0) {
        req.flash('danger', '<p> ' + dangerFlash.join(' </p><p> ') + ' </p>');
    };
    if (successFlash.length !== 0) {
        req.flash('success', '<p> ' + successFlash.join(' </p><p> ') + ' </p>');
    };
    if (errors.length !== 0) {
        errors.forEach((err) => {
            console.log(err);
        });
    };
    cb(true);
}; // issues //item_sizes

fn.summer = (items) => {
    if (items == null) {
        return 0;
    }
    return items.reduce((a, b) => {
        return b['_qty'] == null ? a : a + b['_qty'];
    }, 0);
}; // item_sizes
fn.counter = () => {
    var count = 0;
    return function() {
        return ++count;
    };
}; // Issues

fn.getAllUsersWhere = (where, req, cb) => {
    m.users.findAll({
        where: where,
        include: [
            m.ranks, 
            m.statuses
        ]
    }).then((users) => {
        if (users) {
            cb(users);
        } else {
            req.flash('info', 'No Users Found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error finding users!');
        console.log(err);
        cb(null);
        return null;
    });
}; // issues: 15
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
            where: extended.orders,
            include: [{model: m.item_sizes, as: 'size', include: [m.items, m.sizes]},
                      {model: m.users, include: [m.ranks], as: 'orderedBy'},
                       m.demands,
                       m.receipts,
                       m.issues],
            required: false
        },{
            model: m.issues,
            where: extended.issues,
            include: [{model: m.item_sizes, as: 'size', include: [m.items, m.sizes, {model: m.item_locations, as: 'locations'}]},
                      {model: m.users, as: 'issuedBy', include: [m.ranks]},
                      {model: m.users, as: 'returnedTo', include: [m.ranks]}],
            required: false
        },{
            model: m.requests,
            where: extended.requests,
            include: [{model: m.item_sizes, as: 'size', include: [m.items, m.sizes]},
                      {model: m.users, as: 'requestedBy', include: [m.ranks]},
                      {model: m.users, as: 'approvedBy', include: [m.ranks]}],
            required: false
        },{
            model: m.loancards,
            where: extended.loancards,
            include: [{model: m.users, as: 'issuedBy', include: [m.ranks]},
                      {model: m.loancardlines,
                       as: 'lines',
                       include: [{model: m.item_sizes, as: 'item', include: [m.items, m.sizes]}]}],
            required: false
        });
    }
    m.users.findOne({
        where: {user_id: user_id},
        include: include
    }).then((user) => {
        if (user) {
            cb(user);
        } else {
            req.flash('danger', 'User not found!');
            cb(null);
        };
        return null
    }).catch((err) => {
        req.flash('danger', 'Error Getting User!');
        console.log(err);
        cb(null);
        return null
    });
}; // issues: 40, 166
fn.getAllUserClasses = (req, res, cb) => {
    fn.getAll(m.ranks, req, true, (ranks) => {
        fn.getAll(m.genders, req, true, (genders) => {
            fn.getAll(m.statuses, req, true, (statuses) => {
                var results = {
                    ranks: ranks,
                    statuses: statuses,
                    genders: genders
                };
                cb(results);
            });
        });
    });
}; // users

fn.getIssuesWhere = (where, req, cb) => {
    m.issues.findAll({
        where: where,
        include: [
            {
                model: m.users,
                as:    'issuedTo',
                include: [m.ranks]
            },{
                model: m.users,
                as:    'issuedBy',
                include: [m.ranks]
            },{
                model: m.users,
                as:    'returnedTo',
                include: [m.ranks]
            },{
                model: m.item_locations,
                as:    'issueLocation'
            },{
                model: m.item_locations,
                as:    'returnLocation'
            },{
                model: m.item_sizes,
                as: 'size',
                include:[
                    m.items, 
                    m.sizes,
                    {
                        model: m.item_locations,
                        as: 'locations'
                    }
                ]
            }
        ]
    }).then((issues) => {
        if (!issues) req.flash('info', 'No issues found!');
        cb(issues);    
        return null;    
    }).catch((err) => {
        req.flash('danger', 'Error searching issues')
        console.log(err);
        cb(null);
        return null;
    });
}; // issues: 39
fn.getIssue = (issue_id, req, cb) => {
    m.issues.findOne({
        where: {issue_id: issue_id},
        include: [
            {
                model: m.users,
                as:    'issuedTo',
                include: [m.ranks]
            },{
                model: m.users,
                as:    'issuedBy',
                include: [m.ranks]
            },{
                model: m.users,
                as:    'returnedTo',
                include: [m.ranks]
            },{
                model: m.item_locations,
                as:    'issueLocation'
            },{
                model: m.item_locations,
                as:    'returnLocation'
            },{
                model: m.loancardlines,
                as: 'lc_line'
            },{
                model: m.item_sizes,
                as: 'size',
                include:[
                    m.items, 
                    m.sizes
                ]
            }
        ]
    }).then((issue) => {
        if (!issue) req.flash('danger', 'Issue not found!');
        cb(issue);
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error searching issues');
        console.log(err);
        cb(null);
        return null;
    });
}; // issues: 313

fn.getAllLoancards = (returned, req, cb) => {
    var where = {};
    if (returned === 2) {
        where._closed = null
    } else if (returned === 3) {
        where._closed = {[op.not]: null}
    };
    m.loancards.findAll({
        where: where,
        include: 
        [
            {
                model: m.users,
                as: 'issuedTo',
                include: [m.ranks]
            },{
                model: m.users,
                as: 'issuedBy',
                include: [m.ranks]
            }
        ]
    }).then((loancards) => {
        if (loancards) {
            cb(loancards);
        } else {
            req.flash('info', 'No Loancards Found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error getting Loancards!');
        console.log(err);
        cb(null);
        return null;
    });
}; // loancards
fn.getLoancard = (loancard_id, req, cb) => {
    m.loancards.findOne({
        where: {loancard_id: loancard_id},
        include: 
        [
            {
                model: m.users,
                as: 'issuedTo',
                include: [m.ranks]
            },{
                model: m.users,
                as: 'issuedBy',
                include: [m.ranks]
            },{
                model: m.loancardlines,
                as: 'lines',
                include: 
                [
                    {
                        model: m.item_sizes,
                        as: 'item',
                        include: [m.items, m.sizes]
                    },{
                        model: m.item_nsns,
                        as: 'nsn'
                    },{
                        model: m.users,
                        as: 'receivedBy',
                        include: [m.ranks]
                    }
                ]
            }
        ]
    }).then((loancard) => {
        if (loancard) {
            cb(loancard);
        } else {
            req.flash('danger', 'Loancard not found!');
            cb(null);
        };  
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error getting Loan Card!');
        console.log(err);
        cb(null);
        return null;
    });
}; // loancards
fn.createLoanCardLine = (loancard_id, _line, stock_id, nsn_id, _qty, cb) => {
    var line = {};
    line.loancard_id = loancard_id;
    line._line = _line;
    line.stock_id = stock_id;
    line.nsn_id = nsn_id;
    line._qty_issued = _qty;
    m.loancardlines.create(line)
    .then((newLine) => {
        cb(newLine.line_id); 
        return null;
    }).catch((err) => {
        console.log(err);
        cb(null);
        return null;
    });
}; // issues: 65
fn.createLoanCard = (issuedTo, raisedBy, cb) => {
    var lc = {};
    lc.issued_to = issuedTo;
    lc._date = Date.now();
    lc.user_id = raisedBy;
    m.loancards.create(lc)
    .then((newLoanCard) => {
        cb(newLoanCard.loancard_id);
        return null;
    }).catch((err) => {
        console.log(err);
        cb(null);
        return null;
    });
}; // issues: 103
fn.deleteLoanCard = (loancard_id, cb) => {
    m.loancards.destroy({
        where: {loancard_id: loancard_id}
    }).then((result) => {
        if (result) {
            cb(true);
        } else {
            cb(false);
        };
        return null;
    }).catch((err) => {
        console.log(err);
        cb(false);
        return null;
    });
}; // issues: 148
fn.returnLoanCardLine = (line_id, qty, receivedBy, cb) => {
    m.loancardlines.findOne({
        where: {line_id: line_id}
    }).then((line) => {
        m.loancardlines.update(
            {
                _date: Date.now(),
                _qty_returned: qty,
                received_by: receivedBy
            },
            {
                where: {line_id: line_id}
            }
        ).then((result) => {
            if (result) {
                m.loancardlines.findOne(
                    {where: {
                        loancard_id: line.loancard_id,
                        _date: null
                    }}
                ).then((result) => {
                    if (result) {
                        cb({line: true, lc: false});
                    } else {
                        fn.closeLoancard(line.loancard_id, (result) => {
                            cb({line: true, lc: result});
                        });
                    };
                });
            } else {
                cb({line: false, lc: false});
            };
            return null;
        }).catch((err) => {
            console.log(err);
            cb({line: false, lc: false});
            return null;
        });
    }).catch((err) => {
        console.log(err);
        cb({line: false, lc: false});
    });
}; // issues: 273
fn.closeLoancard = (loancard_id, cb) => {
    m.loancards.update(
        {_closed: Date.now()},
        {
            where: {loancard_id: loancard_id}
        }).then((result) => {
            if (result) {
                cb(true);
            } else {
                cb(false);
            };
            return null;
        }).catch((err) => {
            console.log(err);
            cb(false);
            return null;
        });
}; // functions

fn.getAllItemClasses = (req, cb) => {
    fn.getAll(m.categories, req, true, (categories) => {
        fn.getAll(m.groups, req, true, (groups) => {
            fn.getAll(m.types, req, true, (types) => {
                fn.getAll(m.subtypes, req, true, (subtypes) => {
                    fn.getAll(m.genders, req, true, (genders) => {
                        var results = {
                        categories: categories,
                        groups:     groups,
                        types:      types,
                        subtypes:   subtypes,
                        genders:    genders
                    };
                    cb(results);
                    return null;
                    });
                });
            });
        });
    });
}; // items: 16, 54, 69
fn.getItem = (item_id, includeSizes, req, cb) => {
    var include = [
        m.genders, 
        m.categories, 
        m.groups, 
        m.types, 
        m.subtypes, 
    ];
    if (includeSizes) include.push({model: m.item_sizes, as: 'sizes', include: [m.sizes]});
    m.items.findOne({
        where: {item_id: item_id},
        include: include
    }).then((item) => {
        if (item) {
            cb(item)
        } else {
            req.flash('danger', 'Item not found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error Getting Item!');
        cb(null);
        return null;
    });
}; // items: 127

fn.getItemSize = (stock_id, req, nsns, locations, issues, orders, cb) => {
    var include = [
        m.items, 
        m.sizes, 
        m.suppliers
    ];
    if (issues.include)    include.push({model: m.issues, include: [{model: m.users, as: 'issuedTo', include: [m.ranks]}], where: issues.where, required: false});
    if (orders.include)    include.push({model: m.orders, where: orders.where, required: false});
    if (nsns.include)      include.push({model: m.item_nsns, as: 'nsns'});
    if (locations.include) include.push({model: m.item_locations, as: 'locations'});
    m.item_sizes.findOne({
        where: {stock_id: stock_id},
        include: include
    }).then((item) => {
        if (item) {
            cb(item);
        } else {
            req.flash('danger', 'Size not found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error finding size!')
        console.log(err);
        cb(null);
        return null;
    });
}; // item_locations: 22 // item_nsns: 22 // item_sizes: 59
fn.getAllItemSizesWhere = (where, req, cb) => {
    m.item_sizes.findAll({
        where: where,
        include: [m.sizes]
    }).then((sizes) => {
        if (sizes) {
            cb(sizes);
        } else {
            req.flash('info', 'No sizes found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error getting sizes!')
        console.log(err);
        cb(null);
        return null;
    });
}; // itemSearch
fn.addSize = (size_id, req) => {
    return new Promise((resolve, reject) => {
        m.item_sizes.findOne({
            where: {
                item_id: req.body.details.item_id,
                size_id: size_id
            },
            include: [m.sizes]
        }).then((size) => {
            if (size) {
                reject({flash_type: 'danger', flash_message: 'Size is already assigned: ' + size.size._text, error: null});
            } else {
                m.item_sizes.create({size_id: size_id, item_id: req.body.details.item_id})
                .then((size) => {
                    if (size) {
                        resolve({flash_type: 'success', flash_message: 'SIze added, Stock Id: ' + size.stock_id, error: null});
                    } else {
                        reject({flash_type: 'danger', flash_message: 'Error adding size: ' + size_id, error: null});
                    };
                }).catch((err) => {
                    reject({flash_type: 'danger', flash_message: 'Error adding size: ' + size_id, error: err});
                });
            };
        }).catch((err) => {
            reject({flash_type: 'danger', flash_message: 'Error checking for existing size: ' + size_id, error: err});
        });
    });
}; // item_sizes
fn.getNSN = (nsn_id, req, cb) => {
    m.item_nsns.findOne({
        where: {nsn_id: nsn_id},
        include: [{
            model:m.item_sizes, 
            as: 'size',
            include:[
                m.items, 
                m.sizes
            ]
        }]
    }).then((nsn) => {
        if (nsn) {
            cb(nsn);
        } else {
            req.flash('danger', 'NSN not found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error finding NSN!');
        console.log(err);
        cb(null);
        return null;
    });
}; // item_nsns: 33
fn.getLocation = (location_id, req, cb) => {
    m.item_locations.findOne({
        where: {location_id: location_id},
        include: [
            {
                model: m.item_sizes, 
                as: 'size',
                include:
                [
                    m.items, 
                    m.sizes
                ]
            }
        ]
    }).then((location) => {
        if (location) {
            cb(location);
        } else {
            req.flash('danger', 'Error finding location!');
            console.log(err);
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error finding location!');
        console.log(err);
        cb(null);
        return null;
    });
}; // item_locations: 37

fn.getNotes = (table, id, req, res, cb) => {
    fn.allowed('access_notes', false, req, res, (allowed) => {
        if (allowed || (table === 'users' && req.user.user_id === Number(id))) {
            var whereObj = {
                _link_table: table, 
                _link_id: id
            },
            sn = Number(req.query.sn) || 2;
            if (sn === 2) {
                whereObj._system = false
            } else if (sn === 3) {
                whereObj._system = true
            };
            m.notes.findAll({
                where: whereObj
            }).then((notes) => {
                cb(notes);
                return null;
            }).catch((err) => {
                req.flash('danger', 'Error searching notes')
                console.log(err);
                cb(null);
                return null;
            });
        } else {
            cb(null);
        };
    });
}; // issues: 315 // item_locations: 39// item_nsns: 35

fn.issueLine = (issue, item, loancard_id) => {
    return new Promise((resolve, reject) => {
        fn.createLoanCardLine(loancard_id, currentLine(), issue.stock_id, item.nsn_id, issue._qty, (line_id) => {
            issue.line_id = line_id;
            m.issues.create(issue)
            .then((newIssue) => {
                m.locations.update(
                    {_qty: item.location_qty},
                    {where: {location_id: item.location_id}}
                ).then((result) => {
                    if (result) {
                        resolve({flash_type: 'success', flash_message: 'Issue created, Location quantity updated, Id: ' + newIssue.issue_id, error: null});
                    } else {
                        reject({flash_type: 'danger', flash_message: 'Error Updating Location Quantity', error: null});
                    };
                }).catch((err) => {
                    reject({flash_type: 'danger', flash_message: 'Item Issued, But Error Updating Location Quantity, Id: ' + newIssue.issue_id, error: null});
                });
            })
            .catch((err) => {
                reject({flash_type: 'danger', flash_message: 'Error creating issue!', error: err});
            });
        });
    });
}; // Issues
fn.orderLine = (order) => {
    return new Promise((resolve, reject) => {
        m.orders.create(order)
        .then((newOrder) => {
            if (newOrder) {
                resolve({flash_type: 'success', flash_message: 'Order created, Id: ' + newOrder.order_id, error: null});
            } else {
                reject({flash_type: 'danger', flash_message: 'Error creating order!', error: null});
            };
        })
        .catch((err) => {
            reject({flash_type: 'danger', flash_message: 'Error creating order!', error: err});
        });
    });
}; // orders
fn.requestLine = (request) => {
    return new Promise((resolve, reject) => {
        m.requests.create(request)
        .then((newRequest) => {
            if (newRequest) {
                resolve({flash_type: 'success', flash_message: 'Request created, Id: ' + newRequest.request_id, error: null});
            } else {
                reject({flash_type: 'danger', flash_message: 'Error creating request!', error: null});
            };
        })
        .catch((err) => {
            reject({flash_type: 'danger', flash_message: 'Error creating request!', error: err});
        });
    });
}; // requests
fn.returnLine = (line, user_id) => {
    return new Promise((resolve, reject) => {
        line = JSON.parse(line);
        var returned = new cn.Returned(user_id, line.location_id);
        m.issues.findOne({
            where: {issue_id: line.issue_id}
        }).then((issue) => {
            if (Number(issue.issued_to) !== Number(user_id)) {
                m.issues.update(
                    returned,
                    {
                        where: {issue_id: line.issue_id}
                    }
                ).then((result) => {
                    if (result) {
                        m.item_locations.findOne({
                            where: {location_id: line.location_id}
                        }).then((location) => {
                            m.item_locations.update(
                                {_qty: location._qty + issue._qty},
                                {
                                    where: {location_id: location.location_id}
                                }
                            ).then((result) => {
                                if (result) {
                                    fn.returnLoanCardLine(issue.line_id, issue._qty, user_id, (result) => {

                                    });
                                    resolve({flash_type: 'success', flash_message: 'Line Returned: ' + line.issue_id, error: null});
                                } else {
                                    reject({flash_type: 'danger', flash_message: 'Error Updating Location: ' + line.issue_id, error: null});
                                }
                            }).catch((err) => {
                                reject({flash_type: 'danger', flash_message: 'Error Updating Location: ' + line.issue_id, error: err});
                            });
                        }).catch((err) => {
                            reject({flash_type: 'danger', flash_message: 'Error Getting Location: ' + line.issue_id, error: err});
                        });
                    } else {
                        reject({flash_type: 'danger', flash_message: 'Error Returning Line: ' + line.issue_id, error: null});
                    };
                }).catch((err) => {
                    reject({flash_type: 'danger', flash_message: 'Error Updating Issue: ' + line.issue_id, error: err});
                });
            } else {
                reject({flash_type: 'danger', flash_message: 'You cannot return an item issued to yourself: ' + line.issue_id, error: null});
            };            
        }).catch((err) => {
            reject({flash_type: 'danger', flash_message: 'Error Getting Issue: ' + line.issue_id, error: err});
        });
    });
}; // Issues

fn.getAllSuppliers = (req, cb) => {
    m.suppliers.findAll({
    }).then((suppliers) => {
        if (suppliers) {
            cb(suppliers);
        } else {
            req.flash('info', 'No Suppliers Found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error loading suppliers!')
        console.log(err);
        cb(null);
        return null;
    });
}; // suppliers

fn.getAllOrders = (query, req, cb) => {
    var where = {};
    if (query.placed === 2) {
        where.demand_id = null
    } else if (query.placed === 3) {
        where.demand_id = {[op.not]: null}
    };
    if (query.received === 2) {
        where.receipt_id = null
    } else if (query.received === 3) {
        where.receipt_id = {[op.not]: null}
    };
    if (query.issued === 2) {
        where.issue_id = null
    } else if (query.issued === 3) {
        where.issue_id = {[op.not]: null}
    };
    m.orders.findAll({
        where: where,
        include: 
        [
            m.demands,
            m.receipts,
            m.issues,
            {
                model: m.item_sizes,
                as: 'size',
                include: [m.items, m.sizes]
            },{
                model: m.users,
                as: 'orderedFor',
                include: [m.ranks]
            },{
                model: m.users,
                as: 'orderedBy',
                include: [m.ranks]
            }
        ]
    }).then((orders) => {
        if (orders) {
            cb(orders);
        } else {
            req.flash('info', 'No Orders Found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error getting orders!');
        console.log(err);
        cb(null);
        return null;
    });
}; // orders
fn.getOrder = (order_id, req, cb) => {
    m.orders.findOne({
        where: {order_id: order_id},
        include: [
            {
                model: m.item_sizes,
                as: 'size',
                include: [m.items, m.sizes]
            },{
                model: m.users,
                as: 'orderedFor',
                include: [m.ranks]
            },{
                model: m.users,
                as: 'orderedBy',
                include: [m.ranks]
            },
            m.demands,
            m.receipts,
            m.issues
        ]
    }).then((order) => {
        if (order) {
            cb(order);
        } else {
            req.flash('danger', 'Order not found!');
            cb(null);
        };  
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error getting Order!');
        console.log(err);
        cb(null);
        return null;
    });
}; // orders

fn.getAllRequests = (complete, req, cb) => {
    var where = {},
        closed = Number(complete) || 2;
    if (closed === 2) {
        where._status = 'Pending'
    } else if (closed === 3) {
        where._status = {[op.not]: 'Pending'}
    };
    m.requests.findAll({
        where: where,
        include: [
            {
                model: m.item_sizes,
                as: 'size',
                include: [m.items, m.sizes]
            },{
                model: m.users,
                as: 'requestedFor',
                include: [m.ranks]
            }
        ]
    }).then((requests) => {
        if (requests) {
            cb(requests);
        } else {
            req.flash('info', 'No Requests Found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error getting requests!');
        console.log(err);
        cb(null);
        return null;
    });
}; // requests
fn.getRequest = (request_id, req, cb) => {
    m.requests.findOne({
        where: {request_id: request_id},
        include: [
            {
                model: m.item_sizes,
                as: 'size',
                include: [m.items, m.sizes]
            },{
                model: m.users,
                as: 'requestedFor',
                include: [m.ranks]
            },{
                model: m.users,
                as: 'requestedBy',
                include: [m.ranks]
            },{
                model: m.users,
                as: 'approvedBy',
                include: [m.ranks]
            },
            m.orders
        ]
    }).then((request) => {
        if (request) {
            cb(request);
        } else {
            req.flash('danger', 'Request not found!');
            cb(null);
        };
        return null;
    }).catch((err) => {
        req.flash('danger', 'Error getting request!');
        console.log(err);
        cb(null);
        return null;
    });
}; // requests
module.exports = fn;
