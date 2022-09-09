module.exports = (app, m, fn) => {
    app.get('/get/contacts',    fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        m.contacts.findAndCountAll({
            include: [{
                model: m.supplier_contacts,
                where: req.query.where
            }],
            ...fn.pagination(req.query)
        })
        .then(results => fn.send_res('contacts', res, results, req.query))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/contact',     fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        m.supplier_contacts.findOne({
            where: req.query.where,
            include: [m.contacts]
        })
        .then(contact => {
            if (contact) res.send({success: true, result: contact})
            else res.send({success: false, message: 'Contact not found'});
        })
        .catch(err => fn.send_error(res, err));
    });
    app.post('/contacts',       fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.contacts.create(
            req.body.supplier_id,
            req.body.contact,
            req.body.type
        )
        .then(supplier_contact => res.send({success: true, message: 'Contact created'}))
        .catch(err => fn.send_error(res, err));
    });
    app.put('/contacts',        fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.contacts.edit(
            req.body.contact_id,
            req.body.contact,
            req.user.user_id
        )
        .then(result => res.send({success: true, message: 'Contact updated'}))
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/contacts/:id', fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.suppliers.contacts.delete(req.params.id)
        .then(result => res.send({success: true, message: 'Contact deleted'}))
        .catch(err => fn.send_error(res, err));
    });
};