const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/ranks', mw.isLoggedIn, (req, res) => {
        fn.allowed('ranks_add', true, req, res, allowed => {
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
    });

    // New Form
    app.get('/stores/ranks/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('ranks_add', true, req, res, allowed => {
            res.render('stores/ranks/new');
        });
    });

    // Edit
    app.get('/stores/ranks/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('ranks_edit', true, req, res, allowed => {
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
    });

    // Put
    app.put('/stores/ranks/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('ranks_edit', true, req, res, allowed => {
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
    });

    // Delete
    app.delete('/stores/ranks/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('ranks_delete', true, req, res, allowed => {
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
    });
};