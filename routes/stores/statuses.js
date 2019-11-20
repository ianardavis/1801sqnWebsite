const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/statuses', mw.isLoggedIn, (req, res) => {
        fn.allowed('statuses_add', true, req, res, allowed => {
            fn.create(m.statuses, req.body.status, req, status => {
                res.redirect('/stores/settings');
            });
        });
    });

    // New Form
    app.get('/stores/statuses/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('statuses_add', true, req, res, allowed => {
            res.render('stores/statuses/new');
        });
    });
    // Edit
    app.get('/stores/statuses/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('statuses_edit', true, req, res, allowed => {
            fn.getOne(m.statuses, {status_id: req.params.id}, req, status => {
                if (status) {
                    var query = {};
                    query.sn = req.query.sn || 2;
                    fn.getNotes('statuses', req.params.id, req, res, notes => {
                        res.render('stores/statuses/edit', {
                            status: status,
                            query:  query,
                            notes:  notes
                        });
                    });
                } else {
                    req.flash('danger', 'Error retrieving status!');
                    res.redirect('back');
                };
            });
        });
    });

    // Put
    app.put('/stores/statuses/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('statuses_edit', true, req, res, allowed => {
            fn.update(m.statuses, req.body.status, {status_id: req.params.id}, req, result => {
                res.redirect('/stores/settings')
            });
        });
    });

    // Delete
    app.delete('/stores/statuses/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('statuses_delete', true, req, res, allowed => {
            fn.getOne(m.users, {status_id: req.params.id}, req, status => {
                if (!status) {
                    fn.delete(m.statuses, {status_id: req.params.id}, req, result => {
                        res.redirect('back');
                    });
                } else {
                    req.flash('danger', 'Cannot delete a status whilst it is assigned to a user!');
                    res.redirect('back');
                };
            });
        });
    });
};