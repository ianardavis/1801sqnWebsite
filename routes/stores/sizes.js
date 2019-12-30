module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // New Logic
    app.post('/stores/sizes', isLoggedIn, allowed('sizes_add'), (req, res) => {
        fn.create(
            m.sizes,
            req.body.size
        )
        .then(size => res.redirect('/stores/settings'))
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // New Form
    app.get('/stores/sizes/new', isLoggedIn, allowed('sizes_add'), (req, res) => res.render('stores/sizes/new'));

    // Edit
    app.get('/stores/sizes/:id/edit', isLoggedIn, allowed('sizes_edit'), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.params.id}
        )
        .then(size => {
            fn.getNotes('sizes', req.params.id, req)
            .then(notes => {
                res.render('stores/sizes/edit', {
                    size:  size,
                    query: {sn: req.query.sn || 2},
                    notes: notes
                });
            });
        })
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // Put
    app.put('/stores/sizes/:id', isLoggedIn, allowed('sizes_edit'), (req, res) => {
        fn.update(
            m.sizes,
            req.body.size,
            {size_id: req.params.id}
        )
        .then(result => res.redirect('/stores/settings'))
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });

    // Delete
    app.delete('/stores/sizes/:id', isLoggedIn, allowed('sizes_delete'), (req, res) => {
        fn.getOne(
            m.item_sizes,
            {size_id: req.params.id},
            {include: [], attributes: null, nullOK: true}
        )
        .then(size => {
            if (size) {
                req.flash('danger', 'Cannot delete size whilst it is assigned to items!');
                res.redirect('/stores/settings');
            } else {
                fn.delete(
                    'sizes',
                    {size_id: req.params.id}
                )
                .then(result => {
                    if (result) req.flash('success', 'Size deleted')
                    res.redirect('/stores/settings')
                })
                .catch(err => fn.error(err, '/stores/settings', req, res));
            };
        })
        .catch(err => fn.error(err, '/stores/settings', req, res));
    });
};