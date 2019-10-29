var fn  = {},
    m   = require('./models');

fn.getAll = (table, req, res, warn, cb) => {
    table.findAll({
    }).then((results) => {
        if (warn) if (!results) req.flash('info', 'No ' + table.tableName + ' found!');
        cb(results);
    }).catch((err) => {
        req.flash('danger', 'Error searching ' + table)
        console.log(err);
        cb([]);
    });
};
fn.getAllItemClasses = (req, res, cb) => {
    fn.getAll(m.categories, req, res, true, (categories) => {
        fn.getAll(m.groups, req, res, true, (groups) => {
            fn.getAll(m.types, req, res, true, (types) => {
                fn.getAll(m.subtypes, req, res, true, (subtypes) => {
                    fn.getAll(m.genders, req, res, true, (genders) => {
                        fn.getAll(m.suppliers, req, res, true, (suppliers) => {
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
};
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
};
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
                model: m.items_locations,
                as:    'issueLocation'
            },{
                model: m.items_locations,
                as:    'returnLocation'
            },{
                model: m.items_sizes,
                as: 'size',
                include:[
                    m.items, 
                    m.sizes,
                    {
                        model: m.items_locations,
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
        cb([]);
    });
}
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
                model: m.items_locations,
                as:    'issueLocation'
            },{
                model: m.items_locations,
                as:    'returnLocation'
            },{
                model: m.items_sizes,
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
}
fn.getNotes = (table, id, req, cb) => {
    m.notes.findAll({
        where: {
            _link_table: table, 
            _link_id: id
        }
    }).then((notes) => {
        cb(notes);
    }).catch((err) => {
        req.flash('danger', 'Error searching notes')
        console.log(err);
        cb([]);
    });
};
fn.delete = (allowed, table, where, req, cb) => {
    if (allowed) {
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
    } else {
        req.flash('danger', 'Permission denied!')
        cb(false);
    }
}
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
                model: m.items_sizes,
                as: 'sizes',
                include: [
                    m.sizes,
                    {
                        model: m.items_locations,
                        as: 'locations'
                    },
                    {
                        model: m.items_nsns,
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
}
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
}
fn.allowed = (permission, res, cb) => {
    if (Number(res.locals.permissions[permission]) === 1) {
        cb(true);
    } else {
        cb(false);
    };
};
// fn.raiseLC = (to, by, lines)
// fn.returnLCLine = (line_id, req, res, cb) => {
//     m.loancardlines.update(
//         {},
//         {
//         where: {line_id: line_id},
//         include: [
//             {
//                 model: m.loancards, 
//                 as: 'lc'
//             }
//         ]
//     }).then((line) => {

//     }).catch((err) =>{

//     });
// };

fn.getAllWhere = (table, where, req, res, cb) => {
    table.findAll({
        where: where
    }).then((results) => {
        cb(results);
    }).catch((err) => {
        req.flash('danger', 'Error searching ' + table.tableName)
        console.log(err);
        res.redirect('/stores/items');
    });
};

fn.getOne = (table, req, where, cb) => {
    table.findOne({
        where: where
    }).then((results) => {
        cb(results);
    }).catch((err) => {
        req.flash('danger', 'Error searching in ' + table)
        console.log(err);
        cb([]);
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
    m.items_locations.destroy({
        where: where
    }).then((result) => {
        cb(Boolean(result))
    })
}
fn.deleteNSNs = (req, res, where, cb) => {
    m.items_nsns.destroy({
        where: where
    }).then((result) => {
        cb(Boolean(result))
    })
}
module.exports = fn;