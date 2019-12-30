module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // New Logic
    app.post('/stores/ranks', isLoggedIn, allowed('ranks_add'), (req, res) => {
        fn.create(
            m.ranks, 
            req.body.rank
        )
        .then(rank => res.redirect('/stores/settings'))
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // New Form
    app.get('/stores/ranks/new', isLoggedIn, allowed('ranks_add'), (req, res) => res.render('stores/ranks/new'));

    // Edit
    app.get('/stores/ranks/:id/edit', isLoggedIn, allowed('ranks_edit'), (req, res) => {
        fn.getOne(
            m.ranks,
            {rank_id: req.params.id}
        )
        .then(rank => {
            fn.getNotes('ranks', req.params.id, req)
            .then(notes => {
                res.render('stores/ranks/edit', {
                    rank:  rank,
                    query: {sn: req.query.sn || 2},
                    notes: notes
                });
            });
        })
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // Put
    app.put('/stores/ranks/:id', isLoggedIn, allowed('ranks_edit'), (req, res) => {
        fn.update(
            m.ranks,
            req.body.rank,
            {rank_id: req.params.id}
        )
        .then(result => res.redirect('/stores/settings'))
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // Delete
    app.delete('/stores/ranks/:id', isLoggedIn, allowed('ranks_delete'), (req, res) => {
        fn.getOne(
            m.users,
            {rank_id: req.params.id}
        )
        .then(rank => {
            if (!rank) {
                fn.delete(
                    'ranks',
                    {rank_id: req.params.id}
                )
                .then(result => {
                    if (result) req.flash('success', 'Rank deleted')
                    res.redirect('/stores/settings')
                })
                .catch(err => fn.error(err, '/stores/settings', req, res));
            } else {
                req.flash('danger', 'Cannot delete a rank whilst it is assigned to a user!');
                res.redirect('/stores/settings');
            };
        })
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });
};