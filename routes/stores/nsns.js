module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    // New Form
    app.get('/stores/nsns/new', isLoggedIn, allowed('nsn_add'), (req, res) => {
        fn.getOne(
            m.sizes,
            {size_id: req.query.size_id},
            {include: [m.items]}
        )
        .then(itemsize => res.render('stores/nsns/new', {itemsize: itemsize}))
        .catch(err => fn.error(err, '/stores/sizes/' + req.query.size_id, req, res));
    });
    // New Logic
    app.post('/stores/nsns', isLoggedIn, allowed('nsn_add'), (req, res) => {
        fn.create(
            m.nsns,
            req.body.nsn
        )
        .then(nsn => {
            req.flash('success', 'NSN added')
            if (req.body.default) {
                fn.update(
                    m.sizes,
                    {nsn_id: nsn.nsn_id},
                    {size_id: nsn.size_id}
                )
                .then(result => res.redirect('/stores/sizes/' + nsn.size_id))
                .catch(err => fn.error(err, '/stores/sizes/' + nsn.size_id, req, res));
            } else res.redirect('/stores/sizes/' + nsn.size_id);
        })
        .catch(err => fn.error(err, '/stores/sizes/' + req.body.nsn.size_id, req, res));
    });

    // Edit
    app.get('/stores/nsns/:id/edit', isLoggedIn, allowed('nsn_edit'), (req, res) => {
        fn.getOne(
            m.nsns,
            {nsn_id: req.params.id},
            {include: [inc.sizes()]}
        )
        .then(nsn => {
            fn.getNotes('nsns', req.params.id, req)
            .then(notes => {
                res.render('stores/nsns/edit', {
                    nsn:   nsn,
                    notes: notes,
                    query: {system: req.query.system || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });
    // Put
    app.put('/stores/nsns/:id', isLoggedIn, allowed('nsn_edit'), (req, res) => {
        let actions = [];
        actions.push(
            fn.update(
                m.nsns,
                req.body.nsn,
                {nsn_id: req.params.id}
            )
        );
        if (req.body.default && Number(req.body.currentDefault) !== Number(req.params.id)) {
            actions.push(
                fn.update(
                    m.sizes,
                    {nsn_id: req.params.id},
                    {size_id: req.body.size_id}
                )
            );
        } else if (Number(req.body.currentDefault) === Number(req.params.id)) {
            actions.push(
                fn.update(
                    m.sizes,
                    {nsn_id: null},
                    {size_id: req.body.size_id}
                )
            );
        };
        Promise.allSettled(actions)
        .then(result => {
            req.flash('success', 'NSN updated');
            res.redirect('/stores/sizes/' + req.body.size_id);
        })
        .catch(err => fn.error(err, '/stores/sizes/' + req.body.size_id, req, res));
    });

    // Delete
    app.delete('/stores/nsns/:id', isLoggedIn, allowed('nsn_delete'), (req, res) => {
        fn.delete(
            'nsns', 
            {nsn_id: req.params.id}
        )
        .then(result => {
            fn.update(
                m.sizes,
                {nsn_id: null},
                {nsn_id: req.params.id},
                true
            )
            .then(result => {
                if (result) req.flash('info', 'Default NSN deleted')
                else req.flash('info', 'NSN deleted')
                res.redirect('back');
            })
            .catch(err => fn.error(err, 'back', req, res));
        })
        .catch(err => fn.error(err, 'back', req, res));
    });
};
