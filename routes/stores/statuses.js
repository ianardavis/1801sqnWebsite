module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // New Logic
    app.post('/stores/statuses', isLoggedIn, allowed('statuses_add'), (req, res) => {
        fn.create(
            m.statuses,
            req.body.status
        )
        .then(status => res.redirect('/stores/settings'))
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // New Form
    app.get('/stores/statuses/new', isLoggedIn, allowed('statuses_add'), (req, res) => res.render('stores/statuses/new'));

    // Edit
    app.get('/stores/statuses/:id/edit', isLoggedIn, allowed('statuses_edit'), (req, res) => {
        fn.getOne(
            m.statuses,
            {status_id: req.params.id}
        )
        .then(status => {
            fn.getNotes('statuses', req.params.id, req)
            .then(notes => {
                res.render('stores/statuses/edit', {
                    status: status,
                    query:  {sn: req.query.sn || 2},
                    notes:  notes
                });
            });
        })
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // Put
    app.put('/stores/statuses/:id', isLoggedIn, allowed('statuses_edit'), (req, res) => {
        fn.update(
            m.statuses,
            req.body.status,
            {status_id: req.params.id}
        )
        .then(result => res.redirect('/stores/settings'))
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // Delete
    app.delete('/stores/statuses/:id', isLoggedIn, allowed('statuses_delete'), (req, res) => {
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
                'statuses',
                {status_id: req.params.id}
            )
            .then(result => {
                if (result) req.flash('success', 'Status deleted');
                res.redirect('/stores/settings');
            })
            .catch(err => fn.error(err, '/stores/settings', req, res));
        });
    });
};