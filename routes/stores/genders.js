const   mw = require('../../config/middleware'),
        op = require('sequelize').Op,
        fn = require("../../db/functions");

module.exports = (app, m) => {
    // New Logic
    app.post('/stores/genders', mw.isLoggedIn, (req, res) => {
        fn.allowed('genders_add', true, req, res, allowed => {
            fn.create(m.genders, req.body.gender, req, gender => {
                res.redirect('/stores/settings');
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
            fn.getOne(m.genders, {gender_id: req.params.id}, req, gender => {
                if (gender) {
                    var query = {};
                    query.sn = req.query.sn || 2;
                    fn.getNotes('genders', req.params.id, req, res, notes => {
                        res.render('stores/genders/edit', {
                            gender:  gender,
                            query: query,
                            notes: notes
                        });
                    });
                } else {
                    req.flash('danger', 'Error retrieving gender!');
                    res.redirect('back');
                };
            });
        });
    });

    // Put
    app.put('/stores/genders/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('genders_edit', true, req, res, allowed => {
            fn.update(m.genders, req.body.gender, {gender_id: req.params.id}, req, result => {
                res.redirect('/stores/settings')
            });
        });
    });

    // Delete
    app.delete('/stores/genders/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('genders_delete', true, req, res, allowed => {
            fn.getOne(m.users, {gender_id: req.params.id}, req, gender => {
                if (!gender) {
                    fn.delete(m.genders, {gender_id: req.params.id}, req, result => {
                        res.redirect('back');
                    });
                } else {
                    req.flash('danger', 'Cannot delete a gender whilst it is assigned to a user!');
                    res.redirect('back');
                };
            });
        });
    });
};