const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    // Index
    app.get('/stores/suppliers', isLoggedIn, allowed('access_suppliers'), (req, res) => {
        fn.getAllWhere(
            m.suppliers,
            {supplier_id: {[op.not]: 3}},
            {include: [m.sizes]}
        )
        .then(suppliers => {
            fn.getSetting({setting: 'default_supplier', default: -1})
            .then(defaultSupplier => res.render('stores/suppliers/index', {suppliers: suppliers, _default: defaultSupplier}))
            .catch(err => fn.error(err, '/stores', req, res));
        })
        .catch(err => fn.error(err, '/stores', req, res));
    });

    // New Form
    app.get('/stores/suppliers/new', isLoggedIn, allowed('supplier_add'), (req, res) => res.render('stores/suppliers/new'));
    // New Logic
    app.post('/stores/suppliers', isLoggedIn, allowed('supplier_add'), (req, res) => {
        if (!req.body.supplier._stores) {req.body.supplier._stores = 0};
        fn.create(
            m.suppliers,
            req.body.supplier
        )
        .then(supplier => {
            req.flash('success', 'Supplier added')
            if (req.body.default) setDefault(supplier.supplier_id, req, res)
            else res.redirect('/stores/suppliers/' + supplier.supplier_id);
        })
        .catch(err => fn.error(err, '/stores/suppliers', req, res));
    });
    function setDefault (supplier_id, req, res) {
        fn.editSetting('default_supplier', supplier_id)
        .then(result => {
            if (result) req.flash('success', 'Default supplier updated')
            else req.flash('danger', 'Default supplier NOT updated');
            res.redirect('/stores/suppliers/' + supplier_id);
        })
        .catch(err => fn.error(err, '/stores/suppliers/' + supplier_id, req, res));
    };

    // Edit
    app.get('/stores/suppliers/:id/edit', isLoggedIn, allowed('supplier_edit'), (req, res) => {
        fn.getSetting({setting: 'default_supplier', default: -1})
        .then(defaultSupplier => {
            fn.getAll(m.accounts)
            .then(accounts => {
                fn.getOne(m.suppliers, {supplier_id: req.params.id})
                .then(supplier => res.render('stores/suppliers/edit', {
                    supplier: supplier,
                    _default: defaultSupplier,
                    accounts: accounts
                }))
                .catch(err => fn.error(err, '/stores/suppliers/' + req.params.id, req, res));
            })
            .catch(err => fn.error(err, '/stores/suppliers/' + req.params.id, req, res));
        });
    });
    // Put
    app.put('/stores/suppliers/:id/default', isLoggedIn, allowed('suppliers_edit'), (req, res) => setDefault(req.params.id, req, res));
    app.put('/stores/suppliers/:id', isLoggedIn, allowed('supplier_edit'), (req, res) => {
        if (!req.body.supplier._stores) {req.body.supplier._stores = 0};
        fn.update(
            m.suppliers,
            req.body.supplier,
            {supplier_id: req.params.id}
        )
        .then(result => {
            req.flash('success', 'Supplier updated');
            res.redirect('/stores/suppliers/' + req.params.id);
        })
        .catch(err => fn.error(err, '/stores/suppliers/' + req.params.id, req, res));
    });

    // Delete
    app.delete('/stores/suppliers/:id', isLoggedIn, allowed('supplier_delete'), (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2' && req.params.id !== '3') {
            fn.delete(
                'suppliers',
                {supplier_id: req.params.id}
            )
            .then(result => {
                fn.getSetting({setting: 'default_supplier', default: -1})
                .then(defaultSupplier => {
                    if (Number(defaultSupplier) === Number(req.params.id)) {
                        setDefault('', req, res);
                    } else {
                        req.flash('success', 'Supplier deleted');
                        res.redirect('/stores/suppliers');
                    };
                })
                .catch(err => fn.error(err, '/stores/suppliers', req, res));
            })
            .catch(err => fn.error(err, '/stores/suppliers', req, res));
        } else fn.error(new Error('This supplier can not be deleted!'), '/stores/suppliers/' + req.params.id, req, res);
    });

    // Show
    app.get('/stores/suppliers/:id', isLoggedIn, allowed('access_suppliers'), (req, res) => {
        fn.getOne(
            m.suppliers,
            {supplier_id: req.params.id},
            {include: [
                m.files,
                m.accounts,
                inc.sizes(),
                inc.receipts({as: 'receipts', lines: true})
            ]}
        )
        .then(supplier => {
            fn.getNotes('suppliers', req.params.id, req)
            .then(notes => {
                res.render('stores/suppliers/show', {
                    supplier: supplier,
                    notes:    notes,
                    query:    {system: Number(req.query.system) || 2}
                });
            });
        })
        .catch(err => fn.error(err, '/stores/suppliers', req, res));
    });
};