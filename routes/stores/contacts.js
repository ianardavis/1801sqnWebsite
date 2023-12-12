module.exports = (app, fn) => {
    app.get('/get/contacts', fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        fn.suppliers.contacts.get_all(req.query)
        .then(results => fn.sendRes('contacts', res, results, req.query))
        .catch(err => fn.sendError(res, err));
    });
    app.get('/get/contact',  fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        fn.suppliers.contacts.get(req.query.where)
        .then(contact => res.send({success: true, result: contact}))
        .catch(err => fn.sendError(res, err));
    });

    app.post('/contacts',    fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.contacts.create(
            req.body.supplier_id,
            req.body.contact,
            req.body.type
        )
        .then(supplier_contact => res.send({success: true, message: 'Contact created'}))
        .catch(err => fn.sendError(res, err));
    });
    app.put('/contacts',     fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.contacts.edit(
            req.body.contact_id,
            req.body.contact,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: 'Contact updated'}))
        .catch(err => fn.sendError(res, err));
    });
    
    app.delete('/contacts',  fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.contacts.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Contact deleted'}))
        .catch(err => fn.sendError(res, err));
    });
};