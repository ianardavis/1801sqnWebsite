const   mw = {},
        fn = {};
module.exports = (app, m, allowed) => {
    require("../../db/functions")(fn, m);
    require('../../config/middleware')(mw, fn);
    // New Logic
    app.post('/stores/genders', mw.isLoggedIn, allowed('genders_add', true, fn.getOne, m.permissions), (req, res) => {
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

    // New Form
    app.get('/stores/genders/new', mw.isLoggedIn, allowed('genders_add', true, fn.getOne, m.permissions), (req, res) => {
        res.render('stores/genders/new');
    });
    // Edit
    app.get('/stores/genders/:id/edit', mw.isLoggedIn, allowed('genders_edit', true, fn.getOne, m.permissions), (req, res) => {
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

    // Put
    app.put('/stores/genders/:id', mw.isLoggedIn, allowed('genders_edit', true, fn.getOne, m.permissions), (req, res) => {
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

    // Delete
    app.delete('/stores/genders/:id', mw.isLoggedIn, allowed('genders_delete', true, fn.getOne, m.permissions), (req, res) => {
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
};