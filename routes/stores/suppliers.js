const op = require('sequelize').Op;
module.exports = (app, allowed, fn, isLoggedIn, m) => {
    // Index
    app.get('/stores/suppliers', isLoggedIn, allowed('access_suppliers'), (req, res) => {
        fn.getAllWhere(
            m.suppliers,
            {supplier_id: {[op.not]: 3}}
        )
        .then(suppliers => res.render('stores/suppliers/index', {suppliers: suppliers}))
        .catch(err => fn.error(err, '/stores', req, res));
    });

    // New Logic
    app.post('/stores/suppliers', isLoggedIn, allowed('suppliers_add'), (req, res) => {
        if (!req.body.supplier._stores) {req.body.supplier._stores = 0}
        if (!req.body.supplier._default) {req.body.supplier._default = 0}
        fn.create(
            m.suppliers,
            req.body.supplier
        )
        .then(supplier => res.redirect('/stores/suppliers/' + supplier.supplier_id))
        .catch(err => fn.error(err, '/stores/suppliers', req, res));
    });

    // New Form
    app.get('/stores/suppliers/new', isLoggedIn, allowed('suppliers_add'), (req, res) => res.render('stores/suppliers/new'));

    // Edit
    app.get('/stores/suppliers/:id/edit', isLoggedIn, allowed('suppliers_edit'), (req, res) => {
        fn.getOne(
            m.suppliers,
            {supplier_id: req.params.id}
        )
        .then(supplier => {
            if (supplier) res.render('stores/suppliers/edit', {supplier: supplier});
            else res.redirect('stores/suppliers/' + req.params.id);
        })
        .catch(err => fn.error(err, '/stores/suppliers/' + req.params.id, req, res));
    });

    // Put
    app.put('/stores/suppliers/:id', isLoggedIn, allowed('suppliers_edit'), (req, res) => {
        if (!req.body.supplier._stores) {req.body.supplier._stores = 0}
        if (!req.body.supplier._default) {req.body.supplier._default = 0}
        fn.update(
            m.suppliers,
            req.body.supplier,
            {supplier_id: req.params.id}
        )
        .then(result => {
            if (result) req.flash('success', 'Supplier updated')
            res.redirect('/stores/suppliers/' + req.params.id)
        })
        .catch(err => fn.error(err, '/stores/suppliers/' + req.params.id, req, res));
    });

    // Delete
    app.delete('/stores/suppliers/:id', isLoggedIn, allowed('suppliers_delete'), (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2' && req.params.id !== '3') {
            fn.delete(
                'suppliers',
                {supplier_id: req.params.id}
            )
            .then(result => {
                if (result) req.flash('success', 'Supplier deleted')
                res.redirect('/stores/suppliers')
            })
            .catch(err => fn.error(err, '/stores/suppliers', req, res));
        } else {
            req.flash('danger', 'This supplier can not be deleted!')
            res.redirect('/stores/suppliers/' + req.params.id);
        };
    });

    // Show
    app.get('/stores/suppliers/:id', isLoggedIn, allowed('access_suppliers'), (req, res) => {
        fn.getOne(
            m.suppliers,
            {supplier_id: req.params.id},
            {include: [m.files, m.inventories, {model: m.item_sizes, include: [m.items, m.sizes]}], attributes: null, nullOK: false}
        )
        .then(supplier => {
            fn.getNotes('suppliers', req.params.id, req)
            .then(notes => {
                res.render('stores/suppliers/show', {
                    supplier: supplier, 
                    notes:    notes,
                    query:    {sn: Number(req.query.sn) || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/suppliers', req, res));
    });
};