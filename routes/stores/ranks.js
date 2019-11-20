const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/ranks', mw.isLoggedIn, (req, res) => {
        fn.allowed('ranks_add', true, req, res, allowed => {
            fn.create(m.ranks, req.body.rank, req, rank => {
                res.redirect('/stores/settings');
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
            fn.getOne(m.ranks, {rank_id: req.params.id}, req, rank => {
                if (rank) {
                    var query = {};
                    query.sn = req.query.sn || 2;
                    fn.getNotes('ranks', req.params.id, req, res, notes => {
                        res.render('stores/ranks/edit', {
                            rank:  rank,
                            query: query,
                            notes: notes
                        });
                    });
                } else {
                    req.flash('danger', 'Error retrieving rank!');
                    res.redirect('back');
                };
            });
        });
    });

    // Put
    app.put('/stores/ranks/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('ranks_edit', true, req, res, allowed => {
            fn.update(m.ranks, req.body.rank, {rank_id: req.params.id}, req, result => {
                res.redirect('/stores/settings')
            });
        });
    });

    // Delete
    app.delete('/stores/ranks/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('ranks_delete', true, req, res, allowed => {
            fn.getOne(m.users, {rank_id: req.params.id}, req, rank => {
                if (!rank) {
                    fn.delete(m.ranks, {rank_id: req.params.id}, req, result => {
                        res.redirect('back');
                    });
                } else {
                    req.flash('danger', 'Cannot delete a rank whilst it is assigned to a user!');
                    res.redirect('back');
                };
            });
        });
    });
};