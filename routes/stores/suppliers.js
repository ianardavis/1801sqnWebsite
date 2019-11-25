const   mw = require('../../config/middleware'),
        fn = require('../../db/functions'),
        op = require('sequelize').Op;
        
module.exports = (app, m) => {
    // Index
    app.get('/stores/suppliers', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_suppliers', true, req, res, allowed => {
            fn.getAllWhere(
                m.suppliers,
                {supplier_id: {[op.not]: 3}}
            )
            .then(suppliers => {
                res.render('stores/suppliers/index', {
                    suppliers: suppliers
                });
            })
            .catch(err => {
                fn.error(err, '/stores', req, res);
            });
        });
    });

    // New Logic
    app.post('/stores/suppliers', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_add', true, req, res, allowed => {
            if (!req.body.supplier._stores) {req.body.supplier._stores = 0}
            if (!req.body.supplier._default) {req.body.supplier._default = 0}
            fn.create(
                m.suppliers,
                req.body.supplier
            )
            .then(supplier => {
                res.redirect('/stores/suppliers/' + supplier.supplier_id);
            })
            .catch(err => {
                fn.error(err, '/stores/suppliers', req, res);
            });
        });
    });

    // New Form
    app.get('/stores/suppliers/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_add', true, req, res, allowed => {
            res.render('stores/suppliers/new');
        });
    });

    // Edit
    app.get('/stores/suppliers/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_edit', true, req, res, allowed => {
            fn.getOne(
                m.suppliers,
                {supplier_id: req.params.id}
            )
            .then(supplier => {
                if (supplier) {
                    res.render('stores/suppliers/edit', {
                        supplier: supplier
                    });
                } else {
                    res.render('stores/suppliers/' + req.params.id);
                };
            })
            .catch(err => {
                fn.error(err, '/stores/suppliers/' + req.params.id, req, res);
            });
        });
    });

    // Put
    app.put('/stores/suppliers/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_edit', true, req, res, allowed => {
            if (!req.body.supplier._stores) {req.body.supplier._stores = 0}
            if (!req.body.supplier._default) {req.body.supplier._default = 0}
            fn.update(
                m.suppliers,
                req.body.supplier,
                {supplier_id: req.params.id}
            )
            .then(result => {
                res.redirect('/stores/suppliers/' + req.params.id)
            })
            .catch(err => {
                fn.error(err, '/stores/suppliers/' + req.params.id, req, res);
            });
        });
    });
    // Upload Demand File
    app.post('/stores/suppliers/:id/upload', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_edit', true, req, res, allowed => {
            if (!req.files || Object.keys(req.files).length !== 1) {
                req.flash('info', 'No file or multiple files selected')
                res.redirect('/stores/suppliers/' + req.params.id)
            } else {
                let uploaded = req.files.demandfile;
                uploaded.mv(process.env.ROOT + '/public/res/' + req.files.demandfile.name)
                fn.update(
                    m.suppliers,
                    {_demand: req.files.demandfile.name},
                    {supplier_id: req.params.id}
                )
                .then(result => {
                    if (!result) { 
                        req.flash('danger', 'Error uploading demand file');
                    } else {
                        req.flash('success', 'Demand file uploaded');
                    }
                    res.redirect('/stores/suppliers/' + req.params.id);
                })
                .catch(err => {
                    fn.error(err, '/stores/suppliers/' + req.params.id, req, res);
                });
            };
        });
    });

    // Delete
    app.delete('/stores/suppliers/:id', mw.isLoggedIn, (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2' && req.params.id !== '3') {
            fn.allowed('suppliers_delete', true, req, res, allowed => {
                fn.delete(
                    m.suppliers,
                    {supplier_id: req.params.id}
                )
                .then(result => {
                    res.redirect('/stores/suppliers');
                })
                .catch(err => {
                    fn.error(err, '/stores/suppliers', req, res);
                });
            });
        } else {
            req.flash('danger', 'This supplier can not be deleted!')
            res.redirect('/stores/suppliers/' + req.params.id);
        };
    });

    // Show
    app.get('/stores/suppliers/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_suppliers', true, req, res, allowed => {
            fn.getOne(
                m.suppliers,
                {supplier_id: req.params.id},
                [m.files, m.inventories, {model: m.item_sizes, include: [m.items, m.sizes]}]
            )
            .then(supplier => {
                var query = {};
                query.sn = Number(req.query.sn) || 2
                fn.getNotes('suppliers', req.params.id, req, res)
                .then(notes => {
                    res.render('stores/suppliers/show', {
                        supplier: supplier, 
                        notes:    notes,
                        query:    query
                    });
                });
            })
            .catch(err => {
                fn.error(err, '/stores/suppliers', req, res);
            });
        });
    });
};