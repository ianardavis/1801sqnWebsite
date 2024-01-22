module.exports = (app, fn) => {
    app.get('/suppliers',             fn.loggedIn, fn.permissions.get('supplier_admin'),   (req, res) => res.render('stores/suppliers/index'));
    app.get('/suppliers/:id',         fn.loggedIn, fn.permissions.get('supplier_admin'),   (req, res) => res.render('stores/suppliers/show'));

    app.get('/get/suppliers',         fn.loggedIn, fn.permissions.check('supplier_admin'), (req, res) => {
        if (!req.query.where) req.query.where = {};
        if (req.query.like && req.query.like.name) {
            req.query.where.name = {[fn.op.substring]: req.query.like.name}
        }
        fn.suppliers.findAll(req.query)
        .then(results => fn.sendRes('suppliers', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/supplier',          fn.loggedIn, fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.find(req.query.where)
        .then(supplier => res.send({success: true,  result: supplier}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/suppliers',            fn.loggedIn, fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.create(req.body.supplier)
        .then(result => res.send({success: true, message: 'Supplier added'}))
        .catch(err => res.send({success: true, message: `Error creating supplier: ${err.message}`}));
    });
    app.put('/suppliers/:id/default', fn.loggedIn, fn.permissions.check('supplier_admin'), (req, res) => {
        fn.settings.set('default_supplier', req.params.id)
        .then(result => res.send({success: true, message: 'Supplier saved'}))
        .catch(err => res.send({success: true, message: `Error updating supplier: ${err.message}`}));
    });
    app.put('/suppliers/:id',         fn.loggedIn, fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.edit(req.params.id, req.body.supplier)
        .then(result => res.send({success: true, message: 'Supplier saved'}))
        .catch(err => res.send({success: true, message: `Error updating supplier: ${err.message}`}));
    });

    app.delete('/suppliers/:id',      fn.loggedIn, fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.destroy(req.params.id)
        .then(supplier => res.send({success: true, message: 'Supplier deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};