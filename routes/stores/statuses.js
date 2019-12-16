const   mw = {},
        fn = {};

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    // New Logic
    app.post('/stores/statuses', mw.isLoggedIn, allowed('statuses_add', true, fn.getOne, m.permissions), (req, res) => {
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

    // New Form
    app.get('/stores/statuses/new', mw.isLoggedIn, allowed('statuses_add', true, fn.getOne, m.permissions), (req, res) => {
        res.render('stores/statuses/new');
    });
    // Edit
    app.get('/stores/statuses/:id/edit', mw.isLoggedIn, allowed('statuses_edit', true, fn.getOne, m.permissions), (req, res) => {
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

    // Put
    app.put('/stores/statuses/:id', mw.isLoggedIn, allowed('statuses_edit', true, fn.getOne, m.permissions), (req, res) => {
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

    // Delete
    app.delete('/stores/statuses/:id', mw.isLoggedIn, allowed('statuses_delete', true, fn.getOne, m.permissions), (req, res) => {
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
};