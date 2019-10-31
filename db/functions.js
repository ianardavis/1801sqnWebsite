var fn  = {},
    m   = require('./models');

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
}; // All
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
    }).catch((err) => {
        req.flash('danger', 'Error finding users!');
        console.log(err);
        cb(null);
    });
}; // issues: 15
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
    }).catch((err) => {
        req.flash('danger', 'Error searching ' + table.tableName)
        console.log(err);
        cb(null);
    });
}; // issues: 16 // items: 17
fn.getIssuesForUser = (where, req, cb) => {
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
    }).catch((err) => {
        req.flash('danger', 'Error searching issues')
        console.log(err);
        cb(null);
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
        if (!issue) req.flash('info', 'No issue found');
        cb(issue);
    }).catch((err) => {
        req.flash('danger', 'Error searching issues');
        console.log(err);
        cb([]);
    });
}; // issues: 313
fn.getUser = (user_id, req, cb) => {
    m.users.findOne({
        where: {user_id: user_id},
        include: [m.ranks, m.genders, m.statuses, m.permissions]
    }).then((results) => {
        cb(results);
    }).catch((err) => {
        req.flash('danger', 'Error searching in ' + table)
        console.log(err);
        cb(null);
    });
}; // issues: 40, 166
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
    }).catch((err) => {
        console.log(err);
        cb(null);
    });
}; // issues: 65
fn.createLoanCard = (issuedTo, raisedBy, cb) => {
    var lc = {};
    lc.issued_to = issuedTo;
    lc._date = Date.now();
    lc.user_id = raisedBy;
    m.loancards.create(lc)
    .then((newLoanCard) => {
        cb( newLoanCard.loancard_id);
    }).catch((err) => {
        console.log(err);
        cb(null);
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
    }).catch((err) => {
        console.log(err);
        cb(false);
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
        }).catch((err) => {
            console.log(err);
            cb({line: false, lc: false});
        });
    }).catch((err) => {
        console.log(err);
        cb({line: false, lc: false});
    });
}; // issues: 273
fn.getAllItemClasses = (req, cb) => {
    fn.getAll(m.categories, req, true, (categories) => {
        fn.getAll(m.groups, req, true, (groups) => {
            fn.getAll(m.types, req, true, (types) => {
                fn.getAll(m.subtypes, req, true, (subtypes) => {
                    fn.getAll(m.genders, req, true, (genders) => {
                        fn.getAll(m.suppliers, req, true, (suppliers) => {
                            var results = {
                            categories: categories,
                            groups:     groups,
                            types:      types,
                            subtypes:   subtypes,
                            genders:    genders,
                            suppliers:  suppliers
                        };
                        cb(results);
                        });
                    });
                });
            });
        });
    });
}; // items: 16, 54, 69
fn.getAll = (table, req, warn, cb) => {
    table.findAll({
    }).then((results) => {
        if (warn) if (!results) req.flash('info', 'No ' + table.tableName + ' found!');
        cb(results);
    }).catch((err) => {
        req.flash('danger', 'Error searching ' + table)
        console.log(err);
        cb(null);
    });
}; // functions: 87-92 // items: 70
fn.getOne = (table, where, req, cb) => {
    table.findOne({
        where: where
    }).then((results) => {
        cb(results);
    }).catch((err) => {
        req.flash('danger', 'Error searching in ' + table)
        console.log(err);
        cb(null);
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
    }).catch((err) => {
        req.flash('danger', 'Error adding new record!')
        console.log(err);
        cb(null);
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
    }).catch((err) => {
        req.flash('danger', 'Error editing item!');
        console.log(err);
        cb(false);          
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
    }).catch((err) => {
        req.flash('danger', 'Error deleting from ' + table.tableName);
        console.log(err);
        cb(false);
    });
}; // issues: 302 // item_locations: 66
fn.getItem = (item_id, includeSizes, req, cb) => {
    var include = [
        m.genders, 
        m.categories, 
        m.groups, 
        m.types, 
        m.subtypes, 
        m.suppliers
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
    }).catch((err) => {
        req.flash('danger', 'Error Getting Item!');
        cb(null);
    });
}; // items: 127
fn.getItemSize = (stock_id, req, includeNSNs, includeLocations, includeIssues, includeOrders, cb) => {
    var include = [m.items, m.sizes];
    if (includeIssues)    include.push(m.issues);
    if (includeOrders)    include.push(m.orders);
    if (includeNSNs)      include.push({model: m.item_nsns,as: 'nsns'});
    if (includeLocations) include.push({model: m.item_locations,as: 'locations'});
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
    }).catch((err) => {
        req.flash('danger', 'Error finding size!')
        console.log(err);
        cb(null);
    });
}; // item_locations: 22 // item_nsns: 22 // item_sizes: 59
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
    }).catch((err) => {
        req.flash('danger', 'Error finding location!');
        console.log(err);
        cb(null);
    });
}; // item_locations: 37
fn.getNotes = (table, id, req, cb) => {
    var whereObj = {
        _link_table: table, 
        _link_id: id
    },
        sysnotes = Number(req.query.sys_notes) || 2;
    if (sysnotes === 2) {
        whereObj._system = false
    } else if (sysnotes === 3) {
        whereObj._system = true
    };
    m.notes.findAll({
        where: whereObj
    }).then((notes) => {
        cb(notes);
    }).catch((err) => {
        req.flash('danger', 'Error searching notes')
        console.log(err);
        cb([]);
    });
}; // issues: 315 // item_locations: 39// item_nsns: 35
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
        }
    }).catch((err) => {
        req.flash('danger', 'Error finding NSN!');
        console.log(err);
        cb(null)
    });
}; // item_nsns: 33
fn.summer = (items) => {
    if (items == null) {
        return 0;
    }
    return items.reduce((a, b) => {
        return b['_qty'] == null ? a : a + b['_qty'];
    }, 0);
}; // item_sizes
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
                        resolve({flash_type: 'success', flash_message: 'Issue created, Location quantity updated, Issue Id: ' + newIssue.issue_id, error: null});
                    } else {
                        reject({flash_type: 'danger', flash_message: 'Error Updating Location Quantity', error: null});
                    }
                }).catch((err) => {
                    reject({flash_type: 'danger', flash_message: 'Item Issued, But Error Updating Location Quantity, Issue Id: ' + newIssue.issue_id, error: null});
                });
            })
            .catch((err) => {
                reject({flash_type: 'danger', flash_message: 'Error creating issue!', error: err});
            });
        });
        
    });
}; // Issues
fn.counter = () => {
    var count = 0;
    return function() {
        return ++count;
    };
}; // Issues
fn.returnLine = (line, user_id) => {
    return new Promise((resolve, reject) => {
        line = JSON.parse(line);
        var returned = new cn.Returned(user_id, line.location_id);
        m.issues.findOne({
            where: {issue_id: line.issue_id}
        }).then((issue) => {
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
        }).catch((err) => {
            reject({flash_type: 'danger', flash_message: 'Error Getting Issue: ' + line.issue_id, error: err});
        });
    });
}; // Issues
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
        req.flash('danger', '<li> ' + dangerFlash.join(' </li><li> ') + ' </li>');
    };
    if (successFlash.length !== 0) {
        req.flash('success', '<li> ' + successFlash.join(' </li><li> ') + ' </li>');
    };
    if (errors.length !== 0) {
        errors.forEach((err) => {
            console.log(err);
        });
    };
    cb(true);
}; // issues //item_sizes
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
    }).catch((err) => {
        req.flash('danger', 'Error getting sizes!')
        console.log(err);
        cb(null);
    });
}; // itemSearch
fn.getAllLoancards = (returned, req, cb) => {
    var where = {},
        closed = Number(returned) || 2;
    if (closed === 2) {
        where._closed = null
    } else if (closed === 3) {
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
        }
    }).catch((err) => {
        req.flash('danger', 'Error getting Loan Cards!');
        console.log(err);
        cb(null);
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
    }).catch((err) => {
        req.flash('danger', 'Error getting Loan Card!');
        console.log(err);
        cb(null);
    });
}; // loancards
fn.getAllSuppliers = (req, cb) => {
    m.suppliers.findAll({
    }).then((suppliers) => {
        if (suppliers) {
            cb(suppliers);
        } else {
            req.flash('info', 'No Suppliers Found!');
            cb(null);
        };
    }).catch((err) => {
        req.flash('danger', 'Error loading suppliers!')
        console.log(err);
        cb(null);
    });
}; // suppliers
fn.getAllUserClasses = (req, res, cb) => {
    fn.getAll(m.ranks, req, res, true, (ranks) => {
        fn.getAll(m.genders, req, res, true, (genders) => {
            fn.getAll(m.statuses, req, res, true, (statuses) => {
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





fn.getAllItems = (req, cb) => {
    m.items.findAll({
        where: {},
        include: [
            m.categories,
            m.groups,
            m.types,
            m.subtypes,
            m.genders,
            m.suppliers,
            {
                model: m.item_sizes,
                as: 'sizes',
                include: [
                    m.sizes,
                    {
                        model: m.item_locations,
                        as: 'locations'
                    },
                    {
                        model: m.item_nsns,
                        as: 'nsns'
                    }
                ]
            }
        ]
    }).then((items) => {
        if (!items) req.flash('info', 'No items found!');
        cb(items);
    }).catch((err) => {
        req.flash('danger', 'Error finding items!');
        console.log(err);
        cb([]);
    });
};
fn.permissions = (user_id, cb) => {
    m.permissions.findOne({
        where: {
            user_id: user_id
        }
    }).then((results) => {
        if (!results) {
            cb(false);
        } else {
            cb(results);
        };
    })
};
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
        }).catch((err) => {
            console.log(err);
            cb(false);
        });
};
fn.getOrCreate = (table, req, res, where, cb) => {
    table.findOrCreate({
        where: where
    }).then((results) => {
        cb(results);
    }).catch((err) => {
        req.flash('danger', 'Error searching ' + table)
        console.log(err);
        res.redirect('/stores/items');
    });
};
fn.deleteLocations = (req, res, where, cb) => {
    m.item_locations.destroy({
        where: where
    }).then((result) => {
        cb(Boolean(result))
    })
};
fn.deleteNSNs = (req, res, where, cb) => {
    m.item_nsns.destroy({
        where: where
    }).then((result) => {
        cb(Boolean(result))
    })
};
module.exports = fn;
