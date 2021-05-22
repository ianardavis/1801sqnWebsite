module.exports = (app, m, inc, fn) => {
    app.get('/get/contacts',    fn.li(), fn.permissions.check('access_supplier_contacts', {send: true}), (req, res) => {
        m.supplier_contacts.findAll({
            where: req.query,
            include: [inc.contact()]
        })
        .then(contacts => res.send({success: true, result: contacts}))
        .catch(err => fn.send_error(res, err));
    });
    app.get('/get/contact',     fn.li(), fn.permissions.check('access_supplier_contacts', {send: true}), (req, res) => {
        m.supplier_contacts.findOne({
            where: req.query,
            include: [inc.contact()]
        })
        .then(contact => res.send({success: true, result: contact}))
        .catch(err => fn.send_error(res, err));
    });
    app.post('/contacts',       fn.li(), fn.permissions.check('supplier_contact_add',     {send: true}), (req, res) => {
        m.suppliers.findOne({where: {supplier_id: req.body.supplier_id}})
        .then(supplier => {
            if (!supplier) fn.send_error(res, 'SUpplier not found')
            else {
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
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.put('/contacts',        fn.li(), fn.permissions.check('supplier_contact_add',     {send: true}), (req, res) => {
        m.supplier_contacts.findOne({
            where: {supplier_contact_id: req.body.supplier_contact_id},
            include: [inc.contact()]
        })
        .then(contact => {
            if      (!contact)         fn.send_error(res, 'Contact not found')
            else if (!contact.contact) fn.send_error(res, 'No contact for this record')
            else {
                return contact.contact.update(req.body.contact)
                .then(result => {
                    if (!result) fn.send_error(res, 'Contact not updated')
                    else res.send({success: true, message: 'Contact updated'});
                })
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
    app.delete('/contacts/:id', fn.li(), fn.permissions.check('supplier_contact_delete',   {send: true}), (req, res) => {
        m.supplier_contacts.findOne({
            where: {supplier_contact_id: req.params.id},
            include: [inc.contact()]
        })
        .then(contact => {
            if (!contact) fn.send_error(res, 'Contact not found')
            else {
                let actions = [];
                if (contact.contact) actions.push(contact.contact.destroy());
                actions.push(contact.destroy())
                return Promise.all(actions)
                .then(result => res.send({success: true, message: 'Contact deleted'}))
                .catch(err => fn.send_error(res, err));
            };
        })
        .catch(err => fn.send_error(res, err));
    });
};