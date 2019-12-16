const   mw = {},
        fn = {};

module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    // New Logic
    app.post('/stores/ranks', mw.isLoggedIn, allowed('ranks_add', true, fn.getOne, m.permissions), (req, res) => {
        fn.create(
            m.ranks, 
            req.body.rank
        )
        .then(rank => {
            res.redirect('/stores/settings');
        })
        .catch(err => {
            fn.error(err, '/stores/settings', req, res);
        });
    });

    // New Form
    app.get('/stores/ranks/new', mw.isLoggedIn, allowed('ranks_add', true, fn.getOne, m.permissions), (req, res) => {
        res.render('stores/ranks/new');
    });

    // Edit
    app.get('/stores/ranks/:id/edit', mw.isLoggedIn, allowed('ranks_edit', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.ranks,
            {rank_id: req.params.id}
        )
        .then(rank => {
            var query = {};
            query.sn = req.query.sn || 2;
            fn.getNotes('ranks', req.params.id, req, res)
            .then(notes => {
                res.render('stores/ranks/edit', {
                    rank:  rank,
                    query: query,
                    notes: notes
                });
            });
        })
        .catch(err => {
            fn.error(err, '/stores/settings', req, res);
        });
    });

    // Put
    app.put('/stores/ranks/:id', mw.isLoggedIn, allowed('ranks_edit', true, fn.getOne, m.permissions), (req, res) => {
        fn.update(
            m.ranks,
            req.body.rank,
            {rank_id: req.params.id}
        )
        .then(result => {
            res.redirect('/stores/settings')
        })
        .catch(err => {
            fn.error(err, '/stores/settings', req, res);
        });
    });

    // Delete
    app.delete('/stores/ranks/:id', mw.isLoggedIn, allowed('ranks_delete', true, fn.getOne, m.permissions), (req, res) => {
        fn.getOne(
            m.users,
            {rank_id: req.params.id}
        )
        .then(rank => {
            if (!rank) {
                fn.delete(m.ranks, {rank_id: req.params.id}, req, result => {
                    res.redirect('/stores/settings');
                });
            } else {
                req.flash('danger', 'Cannot delete a rank whilst it is assigned to a user!');
                res.redirect('/stores/settings');
            };
        })
        .catch(err => {
            fn.error(err, '/stores/settings', req, res);
        });
    });
};