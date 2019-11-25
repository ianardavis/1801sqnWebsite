const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/genders', mw.isLoggedIn, (req, res) => {
        fn.allowed('genders_add', true, req, res, allowed => {
            fn.create(
                m.genders, 
                req.body.gender
            )
            .then(result => {
                req.flash('success', 'Gender added')
                res.redirect('/stores/settings');
            })
            .catch(err => {
                fn.error(err, '/stores/settings', req, res);
            });
        });
    });

    // New Form
    app.get('/stores/genders/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('genders_add', true, req, res, allowed => {
            res.render('stores/genders/new');
        });
    });
    // Edit
    app.get('/stores/genders/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('genders_edit', true, req, res, allowed => {
            fn.getOne(
                m.genders, 
                {gender_id: req.params.id}
            )
            .then(gender => {
                var query = {};
                query.sn = req.query.sn || 2;
                fn.getNotes('genders', req.params.id, req, res)
                .then(notes => {
                    res.render('stores/genders/edit', {
                        gender:  gender,
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
    app.put('/stores/genders/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('genders_edit', true, req, res, allowed => {
            fn.update(
                m.genders,
                req.body.gender,
                {gender_id: req.params.id}
            )
            .then(result => {
                req.flash('success', 'Gender updated');
                res.redirect('/stores/settings');
            }).catch(err => {
                fn.error(err, '/stores/settings', req, res);
            });
        });
    });

    // Delete
    app.delete('/stores/genders/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('genders_delete', true, req, res, allowed => {
            fn.delete(
                m.genders,
                {gender_id: req.params.id}
            )
            .then(result => {
                req.flash('success', 'Gender deleted');
                res.redirect('back');
            })
            .catch(err => {
                fn.error(err, '/stores/settings', req, res);
            });
        });
    });
};