module.exports = (app, m, fn) => {
    app.get('/get/contacts',    fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        m.supplier_contacts.findAll({
            where: req.query,
            include: [fn.inc.stores.contact()]
        })
        .then(contacts => res.send({success: true, result: contacts}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/contact',     fn.loggedIn(), fn.permissions.check('access_stores'),  (req, res) => {
        fn.get(
            'supplier_contacts',
            req.query,
            [fn.inc.stores.contact()]
        )
        .then(contact => res.send({success: true, result: contact}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/contacts',       fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.get(
            'suppliers',
            {supplier_id: req.body.supplier_id}
        )
        .then(supplier => {
            return m.contacts.findOrCreate({
                where:    req.body.contact,
                defaults: {type: req.body.type}
            })
            .then(([contact, created]) => {
                return m.supplier_contacts.create({
                    supplier_id: supplier.supplier_id,
                    contact_id: contact.contact_id
                })
                .then(supplier_contact => res.send({success: true, message: 'Contact created'}))
                .catch(err => fn.send_error(res, err));
            })
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/contacts',        fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
       fn.get(
           'supplier_contacts',
           {supplier_contact_id: req.body.supplier_contact_id},
            [fn.inc.stores.contact()]
        )
        .then(contact => {
            if (!contact.contact) fn.send_error(res, 'No contact for this record')
            else {
                return fn.update(contact.contact, req.body.contact)
                .then(result => res.send({success: true, message: 'Contact updated'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/contacts/:id', fn.loggedIn(), fn.permissions.check('supplier_admin'), (req, res) => {
        fn.get(
            'supplier_contacts',
            {supplier_contact_id: req.params.id},
            [fn.inc.stores.contact()]
        )
        .then(contact => {
            let actions = [];
            if (contact.contact) actions.push(contact.contact.destroy());
            actions.push(contact.destroy())
            return Promise.all(actions)
            .then(result => res.send({success: true, message: 'Contact deleted'}))
            .catch(err => fn.send_error(res, err));
        })
        .catch(err => fn.send_error(res, err));
    });
};