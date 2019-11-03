const   mw = require('../../config/middleware'),
        fn = require('../../db/functions');
module.exports = (app, m) => {
    // Index
    app.get('/stores/suppliers', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_suppliers', true, req, res, (allowed) => {
            fn.getAllSuppliers(req, (suppliers) => {
                res.render('stores/suppliers/index', {
                    suppliers: suppliers
                });
            });
        });
    });

    // New Logic
    app.post('/stores/suppliers', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_add', true, req, res, (allowed) => {
                if (!req.body.supplier._stores) {req.body.supplier._stores = 0}
                if (!req.body.supplier._default) {req.body.supplier._default = 0}
                fn.create(m.suppliers, req.body.supplier, req, (supplier) => {
                    if (supplier) {
                        res.redirect('/stores/suppliers/' + supplier.supplier_id);
                    } else {
                        res.redirect('/stores/suppliers');
                    };
                });
        });
    });

    // New Form
    app.get('/stores/suppliers/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_add', true, req, res, (allowed) => {
            res.render('stores/suppliers/new');
        });
    });

    // Edit
    app.get('/stores/suppliers/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_edit', true, req, res, (allowed) => {
            fn.getOne(m.suppliers, {supplier_id: req.params.id}, req, (supplier) => {
                if (supplier) {
                    res.render('stores/suppliers/edit', {
                        supplier: supplier
                    });
                } else {
                    res.render('stores/suppliers/' + req.params.id);
                };
            });
        });
    });

    // Put
    app.put('/stores/suppliers/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_edit', true, req, res, (allowed) => {
            if (!req.body.supplier._stores) {req.body.supplier._stores = 0}
            if (!req.body.supplier._default) {req.body.supplier._default = 0}
            fn.update(m.suppliers, req.body.supplier, {supplier_id: req.params.id}, req, (result) => {
                req.flash('success', 'Supplier edited!');
                res.redirect('/stores/suppliers/' + req.params.id)
            });
        });
    });

    // Delete
    app.delete('/stores/suppliers/:id', mw.isLoggedIn, (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2' && req.params.id !== '3') {
            fn.allowed('suppliers_delete', true, req, res, (allowed) => {
                fn.delete(m.suppliers, {supplier_id: req.params.id}, req, (result) => {
                    res.redirect('/stores/suppliers');
                });
            });
        } else {
            req.flash('danger', 'This supplier can not be deleted!')
            res.redirect('/stores/suppliers/' + req.params.id);
        };
    });

    // Show
    app.get('/stores/suppliers/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_suppliers', true, req, res, (allowed) => {
                fn.getOne(m.suppliers, {supplier_id: req.params.id}, req, (supplier) => {
                    if (supplier) {
                        fn.getNotes('suppliers', req.params.id, req, res, (notes) => {
                            res.render('stores/suppliers/show', {
                                supplier: supplier, 
                                notes: notes
                            });
                        });
                    } else {
                        res.redirect('/stores/suppliers');
                    };
                });
        });
    });
};