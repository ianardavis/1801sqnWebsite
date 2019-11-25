const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/statuses', mw.isLoggedIn, (req, res) => {
        fn.allowed('statuses_add', true, req, res, allowed => {
            fn.create(
                m.statuses,
                req.body.status
            )
            .then(status => {
                res.redirect('/stores/settings');
            })
            .catch(err => {
                fn.error(err, '/stores/settings', req, res);
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
            fn.getOne(
                m.statuses,
                {status_id: req.params.id}
            )
            .then(status => {
                var query = {};
                query.sn = req.query.sn || 2;
                fn.getNotes('statuses', req.params.id, req, res)
                .then(notes => {
                    res.render('stores/statuses/edit', {
                        status: status,
                        query:  query,
                        notes:  notes
                    });
                });
            })
            .catch(err => {
                fn.error(err, '/stores/settings', req, res);
            });
        });
    });

    // Put
    app.put('/stores/statuses/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('statuses_edit', true, req, res, allowed => {
            fn.update(
                m.statuses,
                req.body.status,
                {status_id: req.params.id}
            )
            .then(result => {
                res.redirect('/stores/settings')
            })
            .catch(err => {
                fn.error(err, '/stores/settings', req, res);
            });
        });
    });

    // Delete
    app.delete('/stores/statuses/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('statuses_delete', true, req, res, allowed => {
            fn.getOne(
                m.users,
                {status_id: req.params.id}
            )
            .then(status => {
                req.flash('danger', 'Cannot delete a status whilst it is assigned to a user!');
                res.redirect('back');
            })
            .catch(err => {
                fn.delete(
                    m.statuses,
                    {status_id: req.params.id}
                )
                .then(result => {
                    res.redirect('/stores/settings');
                })
                .catch(err => {
                    fn.error(err, '/stores/settings', req, res);
                });
            });
        });
    });
};