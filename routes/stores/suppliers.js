const   mw = require('../../config/middleware'),
        fn = require('../../db/functions');
module.exports = (app, m) => {
    // Index
    app.get('/stores/suppliers', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_suppliers', res, (allowed) => {
            if (allowed) {
                m.suppliers.findAll({
                    attributes: ['_name', 'supplier_id']
                }).then((suppliers) => {
                    res.render('stores/suppliers/index', {
                        suppliers: suppliers
                    });
                }).catch((err) => {
                    req.flash('danger', 'Error loading suppliers!')
                    console.log(err);
                    res.redirect('/stores');
                });
            } else {
                req.flash('danger', 'Permission denied!')
                res.redirect('/stores');
            }
        });
    });

    // New Logic
    app.post('/stores/suppliers', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_add', res, (allowed) => {
            if (allowed) {
                if (!req.body.supplier._stores) {req.body.supplier._stores = 0}
                if (!req.body.supplier._default) {req.body.supplier._default = 0}
                m.suppliers.create(
                    req.body.supplier
                ).then((supplier) => {
                    if (supplier) {
                        req.flash('success', 'Supplier added!');
                        res.redirect('/stores/supplier/' + supplier.supplier_id);
                    } else {
                        req.flash('danger', 'Error adding new supplier!');
                        res.redirect('/stores/supplier');
                    }
                }).catch((err) => {
                    req.flash('danger', 'Error adding new supplier!')
                    console.log(err);
                    res.redirect('/stores/suppliers');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/suppliers');
            }
        });
    });

    // New Form
    app.get('/stores/suppliers/new', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_add', res, (allowed) => {
            if (allowed) {
                res.render('stores/suppliers/new');
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/suppliers');
            }
        });
    });

    // Edit
    app.get('/stores/suppliers/:id/edit', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_edit', res, (allowed) => {
            if (allowed) {
                m.suppliers.findOne({
                    where: {
                        supplier_id: req.params.id
                    }
                }).then((supplier) => {
                    if (!supplier) {
                        req.flash('danger', 'Error retrieving supplier!');
                        res.render('stores/suppliers/' + req.params.id);
                    } else {
                        res.render('stores/suppliers/edit', {
                            supplier: supplier
                        });
                    }
                }).catch((err) => {
                    req.flash('danger', 'Error loading suppliers!');
                    console.log(err);
                    res.redirect('stores/suppliers/' + req.params.id);
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/suppliers');
            }
        });
    });

    // Put
    app.put('/stores/suppliers/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('suppliers_edit', res, (allowed) => {
            if (allowed) {
                if (!req.body.supplier._stores) {req.body.supplier._stores = 0}
                if (!req.body.supplier._default) {req.body.supplier._default = 0}
                m.suppliers.update(
                    req.body.supplier
                    ,{
                        where: {supplier_id: req.params.id}
                    }
                ).then((supplier) => {
                    req.flash('success', 'Supplier edited!');
                    res.redirect('/stores/suppliers/' + req.params.id)
                }).catch((err) => {
                    req.flash('danger', 'Error editing supplier!');
                    console.log(err);
                    res.redirect('/stores/suppliers/' + req.params.id);            
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/suppliers');
            }
        });
    });

    // Delete
    app.delete('/stores/suppliers/:id', mw.isLoggedIn, (req, res) => {
        if (req.params.id !== '1' && req.params.id !== '2' && req.params.id !== '3') {
            fn.allowed('suppliers_delete', res, (allowed) => {
                fn.delete(allowed, m.suppliers, {supplier_id: req.params.id}, req, (result) => {
                    res.redirect('/stores/suppliers');
                });
            });
        } else {
            req.flash('danger', 'This supplier is mandatory and can not be deleted!')
            res.redirect('/stores/suppliers/' + req.params.id);
        };
    });

    // Show
    app.get('/stores/suppliers/:id', mw.isLoggedIn, (req, res) => {
        fn.allowed('access_suppliers', res, (allowed) => {
            if (allowed) {
                m.suppliers.findOne({
                    where: {supplier_id: req.params.id}
                }).then((supplier) => {
                    if (!supplier) {
                        req.flash('danger', 'Error loading suppliers!');
                    } else {
                        fn.getNotes('suppliers', req.params.id, req, (notes) => {
                            res.render('stores/suppliers/show', {
                                supplier: supplier, 
                                notes: notes
                            });
                        });
                    };
                }).catch((err) => {
                    req.flash('danger', 'Error finding supplier!');
                    console.log(err);
                    res.redirect('/stores');
                });
            } else {
                req.flash('danger', 'Permission denied!');
                res.redirect('/stores/suppliers');
            };
        });
    });
}