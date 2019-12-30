module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // New Logic
    app.post('/stores/nsns', isLoggedIn, allowed('nsns_add'), (req, res) => {
        fn.create(
            m.nsns,
            req.body.nsn
        )
        .then(nsn => {
            req.flash('success', 'NSN added')
            if (req.body.default) {
                fn.update(
                    m.item_sizes,
                    {nsn_id: nsn.nsn_id},
                    {itemsize_id: nsn.itemsize_id}
                )
                .then(result => res.redirect('/stores/item_sizes/' + nsn.itemsize_id))
                .catch(err => fn.error(err, '/stores/item_sizes/' + nsn.itemsize_id, req, res));
            } else res.redirect('/stores/item_sizes/' + nsn.itemsize_id);
        })
        .catch(err => fn.error(err, '/stores/item_sizes/' + req.body.nsn.itemsize_id, req, res));
    });

    // New Form
    app.get('/stores/nsns/new', isLoggedIn, allowed('nsns_add'), (req, res) => {
        fn.getOne(
            m.item_sizes,
            {itemsize_id: req.query.itemsize_id},
            {
                include: fn.itemSizeInclude(
                    {include: false}, 
                    {include: false}, 
                    {include: false}, 
                    {include: false}, 
                    {include: false}
                ),
                attributes: null,
                nullOK: false
            }
        )
        .then(itemsize => res.render('stores/nsns/new', {itemsize: itemsize}))
        .catch(err => fn.error(err, '/stores/item_sizes/' + req.query.itemsize_id, req, res));
    });

    // Edit
    app.get('/stores/nsns/:id/edit', isLoggedIn, allowed('nsns_edit'), (req, res) => {
        fn.getOne(
            m.nsns,
            {nsn_id: req.params.id},
            {include: [{model: m.item_sizes, include: [m.items, m.sizes]}], attributes: null, nullOK: false}
        )
        .then(nsn => {
            fn.getNotes('nsns', req.params.id, req)
            .then(notes => {
                res.render('stores/nsns/edit', {
                    nsn:   nsn,
                    notes: notes,
                    query: {sn: req.query.sn || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/items', req, res));
    });

    function editDefault() {

    };
    // Put
    app.put('/stores/nsns/:id', isLoggedIn, allowed('nsns_edit'), (req, res) => {
        fn.getOne(
            m.nsns,
            {nsn_id: req.params.id}
        )
        .then(nsn => {
            var actions = [];
            if (req.body.default) {
                if (Number(req.body.currentDefault) !== Number(nsn.nsn_id)) {
                    actions.push(
                        fn.update(
                            m.item_sizes,
                            {nsn_id: nsn.nsn_id},
                            {itemsize_id: nsn.itemsize_id}
                        )
                    );
                };
            } else {
                if (Number(req.body.currentDefault) === Number(nsn.nsn_id)) {
                    actions.push(
                        fn.update(
                            m.item_sizes,
                            {nsn_id: null},
                            {itemsize_id: nsn.itemsize_id}
                        )
                    );
                };
            };
            actions.push(
                fn.update(
                    m.nsns,
                    req.body.nsn,
                    {nsn_id: req.params.id}
                )
            )
            Promise.all(actions)
            .then(result => res.redirect('/stores/item_sizes/' + nsn.itemsize_id))
            .catch(err => fn.error(err, '/stores/item_sizes/' + nsn.itemsize_id, req, res));
        })
        .catch(err => fn.error(err, 'back', req, res));
    });
    // Delete
    app.delete('/stores/nsns/:id', isLoggedIn, allowed('nsns_delete'), (req, res) => {
        fn.delete(
            'nsns', 
            {nsn_id: req.params.id}
        )
        .then(result => {
            fn.update(
                m.item_sizes,
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
