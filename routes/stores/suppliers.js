const op = require('sequelize').Op;
module.exports = (app, allowed, fn, inc, isLoggedIn, m) => {
    //INDEX
    app.get('/stores/suppliers',             isLoggedIn, allowed('access_suppliers'),               (req, res) => {
        fn.getSetting({setting: 'default_supplier', default: -1})
        .then(defaultSupplier => res.render('stores/suppliers/index', {_default: defaultSupplier}))
        .catch(err => fn.error(err, '/stores', req, res));
    });
    //NEW
    app.get('/stores/suppliers/new',         isLoggedIn, allowed('supplier_add'), (req, res) => res.render('stores/suppliers/new'));
    //SHOW
    app.get('/stores/suppliers/:id',         isLoggedIn, allowed('access_suppliers'),               (req, res) => {
        fn.getOne(
            m.suppliers,
            {supplier_id: req.params.id},
            {include: [
                m.files,
                m.accounts
            ]}
        )
        .then(supplier => {
            fn.getSetting({setting: 'default_supplier', default: -1})
            .then(defaultSupplier => {
                res.render('stores/suppliers/show', {
                    _default: defaultSupplier,
                    supplier: supplier,
                    notes:    {table: 'suppliers', id: supplier.supplier_id},
                    show_tab: req.query.tab || 'details'
                });
            })
            .catch(err => fn.error(err, '/stores/suppliers', req, res));
        })
        .catch(err => fn.error(err, '/stores/suppliers', req, res));
    });
    //EDIT
    app.get('/stores/suppliers/:id/edit',    isLoggedIn, allowed('supplier_edit'),                  (req, res) => {
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
    //ASYNC GET
    app.get('/stores/getsuppliers',          isLoggedIn, allowed('access_suppliers', {send: true}), (req, res) => {
        fn.getAll(
            m.suppliers,
            [m.sizes]
        )
        .then(suppliers => res.send({result: true, suppliers: suppliers}))
        .catch(err => fn.send_error(err, res));
    });

    //POST
    app.post('/stores/suppliers',            isLoggedIn, allowed('supplier_add',     {send: true}), (req, res) => {
        if (!req.body.supplier._stores) {req.body.supplier._stores = 0};
        fn.create(
            m.suppliers,
            req.body.supplier
        )
        .then(supplier => {
            if (req.body.default && req.body.default === '1') setDefault(supplier.supplier_id, res)
            else res.send({result: true, message: 'Supplier added'});
        })
        .catch(err => fn.send_error(err, res));
    });

    //PUT
    app.put('/stores/suppliers/:id/default', isLoggedIn, allowed('supplier_edit',    {send: true}), (req, res) => {
        fn.getOne(
            m.suppliers,
            {supplier_id: req.params.id}
        )
        .then(supplier => {
            fn.editSetting('default_supplier', supplier.supplier_id)
            .then(result => {
                if (result) res.send({result: true, message: 'Default supplier updated'})
                else  res.send({result: false, message: 'Default supplier NOT updated'});
            })
            .catch(err => fn.send_error(err, res));
        })
        .catch(err => fn.send_error(err, res));
    });
    app.put('/stores/suppliers/:id',         isLoggedIn, allowed('supplier_edit',    {send: true}), (req, res) => {
        if (req.body.supplier.account_id === '') {req.body.supplier.account_id = null};
        fn.update(
            m.suppliers,
            req.body.supplier,
            {supplier_id: req.params.id}
        )
        .then(result => res.send({result: true, message: 'Supplier saved'}))
        .catch(err => fn.send_error(err, res));
    });

    //DELETE
    app.delete('/stores/suppliers/:id',      isLoggedIn, allowed('supplier_delete',  {send: true}), (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2') {
            fn.delete(
                m.suppliers,
                {supplier_id: req.params.id}
            )
            .then(result => {
                fn.getSetting({setting: 'default_supplier', default: -1})
                .then(defaultSupplier => {
                    if (Number(defaultSupplier) === Number(req.params.id)) {
                        setDefault('', res);
                    } else res.send({result: true, message: 'Supplier deleted'});
                })
                .catch(err => fn.send_error(err,message, res));
            })
            .catch(err => fn.send_error(err,message, res));
        } else fn.send_error('This supplier can not be deleted!', res);
    });

    function setDefault (supplier_id, res) {
        fn.editSetting('default_supplier', supplier_id)
        .then(result => {
            if (result) res.send({result: true, message: 'Default supplier updated'})
            else res.send({result: true, message: 'Default supplier NOT updated'});
        })
        .catch(err => fn.send_error(err,message, res));
    };
};