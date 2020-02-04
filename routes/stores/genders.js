module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // New Logic
    app.post('/stores/genders', isLoggedIn, allowed('genders_add'), (req, res) => {
        fn.create(
            m.genders, 
            req.body.gender
        )
        .then(result => {
            req.flash('success', 'Gender added')
            res.redirect('/stores/settings');
        })
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });
    // New Form
    app.get('/stores/genders/new', isLoggedIn, allowed('genders_add'), (req, res) => res.render('stores/genders/new'));
    
    // Edit
    app.get('/stores/genders/:id/edit', isLoggedIn, allowed('genders_edit'), (req, res) => {
        fn.getOne(
            m.genders, 
            {gender_id: req.params.id}
        )
        .then(gender => {
            fn.getNotes('genders', req.params.id, req)
            .then(notes => {
                res.render('stores/genders/edit', {
                    gender: gender,
                    query:  {sn: req.query.sn || 2},
                    notes:  notes
                });
            });
        })
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });
    // Put
    app.put('/stores/genders/:id', isLoggedIn, allowed('genders_edit'), (req, res) => {
        fn.update(
            m.genders,
            req.body.gender,
            {gender_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Gender updated');
            res.redirect('/stores/settings');
        }).catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // Delete
    app.delete('/stores/genders/:id', isLoggedIn, allowed('genders_delete'), (req, res) => {
        fn.delete(
            'genders',
            {gender_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Gender deleted');
            res.redirect('back');
        })
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });
};