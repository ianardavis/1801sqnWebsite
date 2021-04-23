module.exports = (app, m, pm, op, inc, li, send_error) => {
    app.get('/get/contacts', li, pm.check('access_supplier_contacts', {send: true}), (req, res) => {
        m.supplier_contacts.findAll({
            where: req.query,
            include: [inc.contact()]
        })
        .then(contacts => res.send({success: true, result: contacts}))
        .catch(err => send_error(res, err));
    });
    app.get('/get/contact',   li, pm.check('access_supplier_contacts', {send: true}), (req, res) => {
        m.supplier_contacts.findOne({
            where: req.query,
            include: [inc.contact()]
        })
        .then(contact => res.send({success: true, result: contact}))
        .catch(err => send_error(res, err));
    });
};