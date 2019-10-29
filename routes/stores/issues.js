const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    //userlist
    app.get('/stores/issues/userlist', mw.isLoggedIn, (req, res) => {
       fn.allowed('access_issues', res, (allowed) => {
            if (allowed) {
                var q_status = Number(req.query.status) || 1;
                m.users.findAll({
                    where: {
                        user_id: {[op.not]: 1},
                        _status: q_status
                    },
                    include: [
                        m.ranks, 
                        m.statuses
                    ]
                }).then((users) => {
                    m.statuses.findAll({
                        where: {
                            status_id: {[op.not]: 4}
                        },
                    }).then((statuses) => {
                        res.render('stores/issues/user_list', {
                            users:    users,
                            statuses: statuses,
                            status:   q_status
                        });
                    }).catch((err) => {
                        req.flash('danger', 'Error finding statuses!');
                        console.log(err);
                        res.redirect('/stores');
                    });
                }).catch((err) => {
                    req.flash('danger', 'Error finding users!');
                    console.log(err);
                    res.redirect('/stores');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores');
            };            
        });
    });
    
    // index
    app.get('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', res, (allowed) => {
            if (Number.isInteger(Number(req.query.user))) {
                if (allowed || Number(req.query.user) == Number(req.user.user_id)) {
                    var whereObj = {issued_to: req.query.user},
                        returned = Number(req.query.returned) || 2;
                    if (returned === 2) {
                        whereObj.returned_to = null
                    } else if (returned === 3) {
                        whereObj.returned_to = {[op.not]: null}
                    }
                    fn.getIssuesForUser(whereObj,req, (issues) => {
                        m.users.findOne({
                            where: {user_id: req.query.user},
                            include: [m.ranks]
                        }).then((user) => {
                            res.render('stores/issues/index', {
                                selectedUser: user,
                                returned: returned,
                                issues:   issues
                            });
                        }).catch((err) => {
                            req.flash('danger', 'Error finding user!');
                            console.log(err);
                            res.redirect('/stores/issues/userlist');
                        });
                    });
                } else {
                    req.flash('danger', 'Permission denied!');
                    res.redirect('/stores');
                };   
            } else {
                req.flash('danger', 'No issue specified!');
                res.redirect('/stores/issues/userlist');
            }                      
        });
    });

    //new Logic
    app.post('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_add', res, (allowed) => {
            if (allowed) {
                if (req.body.selected) {
                    req.body.selected.forEach((item) => {
                        item = JSON.parse(item);
                        var issue = req.body.issue;
                        issue.stock_id = item.stock_id;
                        issue._qty = item.qty;
                        issue.issued_by = req.user.user_id;
                        issue.issue_location = item.location_id;
                        m.issues.create(issue
                        ).then((newIssue) => {
                            m.items_locations.update(
                                {_qty: Number(item.location_qty)},
                                {where: {location_id: item.location_id}}
                            ).then((result) => {
                                req.flash('success', 'Issue created, Location quantity updated');
                                res.redirect('/stores/issues?user=' + req.body.issue.issued_to);
                            }).catch((err) => {
                                console.log(err);
                                req.flash('danger', 'Error updating location quantity');
                                req.flash('success', 'Issue created');
                                res.redirect('/stores/issues?user=' + req.body.issue.issued_to);
                            });
                        }).catch((err) => {
                            req.flash('danger', 'Error creating issue!');
                            console.log(err);
                            res.redirect('/stores/issues?user=' + req.body.issue.issued_to);
                        });
                    });
                } else {
                    req.flash('info', 'No items selected!');
                    res.redirect('/stores/issues?user=' + req.body.issue.issued_to);
                }
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/issues?user=' + req.body.issue.issued_to);
            };
        });
    });

    //new form
    app.get('/stores/issues/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_add', res, (allowed) => {
            if (req.query.user) {
                if (allowed && req.query.user !== req.user.user_id) {
                    m.users.findOne({
                        where: {user_id: req.query.user},
                        include: [
                            m.ranks,
                            m.statuses,
                            m.genders
                        ]
                    }).then((user) => {
                        if (user.status.status_id !== 1) {
                            req.flash('danger', 'Issues can only be made to current users')
                            res.redirect('/stores/issues/userlist');
                        } else {
                            fn.getAllItems(req, (items) => {
                                if (items) {
                                    res.render('stores/issues/new', {
                                        items: items,
                                        items_JSON: JSON.stringify(items),
                                        selectedUser: user
                                    }); 
                                } else {
                                    req.flash('danger', 'No items found'),
                                    res.redirect('/stores/issues?user=' + req.query.user)
                                };
                            });
                        };
                    }).catch((err)=> {
                        req.flash('danger', 'Error finding user!');
                        res.redirect('/stores/issues/userlist');
                    });
                } else {
                    req.flash('danger', 'Permission denied!');
                    res.redirect('/stores/issues?user=' + req.query.user);
                };
            } else {
                req.flash('danger', 'No user specified!');
                res.redirect('/stores/issues/userlist');
            };
        });
    });

    //edit
    app.get('/stores/issues/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_edit', res, (allowed) => {
            if (allowed) {
                res.redirect('/stores/issues/' + req.params.id);
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/issues/' + req.params.id);
            }
        });
    });

    function Returned(returnedTo, location) {
        this.returned_to = returnedTo;
        this.return_location = location;
        this._date_returned = Date.now();
    }
    function returnLine(line, user_id) {
        return new Promise((resolve, reject) => {
            line = JSON.parse(line);
            var returned = new Returned(user_id, line.location_id);
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
                        m.items_locations.findOne({
                            where: {location_id: line.location_id}
                        }).then((location) => {
                            m.items_locations.update(
                                {_qty: location._qty + issue._qty},
                                {
                                    where: {location_id: location.location_id}
                                }
                            ).then((result) => {
                                resolve({flash_type: 'success', flash_message: 'Line Returned: ' + line.issue_id, error: null});
                            }).catch((err) => {
                                reject({flash_type: 'danger', flash_message: 'Error Updating Location: ' + line.issue_id, error: err});
                            });
                        }).catch((err) => {
                            reject({flash_type: 'danger', flash_message: 'Error Getting Location: ' + line.issue_id, error: err});
                        });
                    } else {
                        reject({flash_type: 'danger', flash_message: 'Error Returning Line: ' + line.issue_id, error: null})
                    };
                }).catch((err) => {
                    reject({flash_type: 'danger', flash_message: 'Error Updating Issue: ' + line.issue_id, error: err});
                });
            }).catch((err) => {
                reject({flash_type: 'danger', flash_message: 'Error Getting Issue: ' + line.issue_id, error: err});
            });
        });
    };
    //Return
    app.put('/stores/issues', mw.isLoggedIn, (req, res) => {
        fn.allowed('issues_return', res, (allowed) => {
            if (allowed) {
                var lines = [];
                req.body.locations.map((line) => {
                    if (line) {
                        lines.push(returnLine(line, req.user.user_id))
                    };
                });
                if (lines.length > 0) {
                    Promise.all(lines)
                    .then(results => {
                        var dangerFlash  = [],
                            successFlash = [],
                            errors       = [];
                        results.forEach((result) => {
                            if (result !== 'null') {
                                if (result.flash_type === 'danger') {
                                    dangerFlash.push(result.flash_message);
                                } else if (result.flash_type === 'success') {
                                    successFlash.push(result.flash_message);
                                }
                                if (result.error !== null) {
                                    errors.push(result.error);
                                }
                            }
                        });
                        if (dangerFlash.length !== 0) {
                            req.flash('danger', dangerFlash.join('<br>'));
                        };
                        if (successFlash.length !== 0) {
                            req.flash('success', successFlash.join('<br>'));
                        };
                        if (errors.length !== 0) {
                            errors.forEach((err) => {
                                console.log(err);
                            });
                        };
                        res.redirect('/stores/issues?user=' + req.body.selectedUser);
                    })
                    .catch(err => {
                        console.log(err);
                        res.redirect('/stores/issues?user=' + req.body.selectedUser);
                    });
                } else {
                    res.redirect('/stores/issues?user=' + req.body.selectedUser);
                }
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/issues?user=' + req.body.selectedUser);
            };
        });
    });

    //delete
    app.delete('/stores/issues/id', mw.isLoggedIn, (req, res) => {
        if (req.query.user) {
            fn.allowed('issues_delete', res, (allowed) => {
                fn.delete(allowed, m.issues, {issue_id: req.params.id}, req, (result) => {
                    res.redirect('/stores/issues?user=' + req.query.user)
                });
            });
        };
    });

    //show
    app.get('/stores/issues/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_issues', res, (allowed) => {
            fn.getIssue(req.params.id, req, (issue) => {
                if (allowed || issue.issued_to.user_id === req.user.user_id) {
                    fn.getNotes('issues', req.params.id, req, (notes) => {
                        res.render('stores/issues/show', {
                                issue: issue,
                                notes: notes
                        })
                    });
                } else {
                    req.flash('danger', 'Permission denied!');
                    res.redirect('/stores');
                }; 
            });
        });
    });
};