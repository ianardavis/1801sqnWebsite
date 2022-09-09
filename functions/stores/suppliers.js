module.exports = function (m, fn) {
    fn.suppliers = {contacts: {}, addresses: {}};

    fn.suppliers.get = function (supplier_id, includes = []) {
        return new Promise((resolve, reject) => {
            m.suppliers.findOne({
                where: {supplier_id: supplier_id},
                include: [
                    fn.inc.stores.account()
                ].concat(includes)
            })
            .then(supplier => {
                if (supplier) resolve(supplier)
                else reject(new Error('Supplier not found'));
            })
            .catch(err => reject(err));
        });
    };
    fn.suppliers.edit = function (supplier_id, details) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get(supplier_id)
            .then(supplier => {
                supplier.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    function get(id, table) {
        return new Promise((resolve, reject) => {
            let where = {};
            where[`supplier_${table_si}_id`] = id;
            m[`supplier_${table.pl}`].findOne({
                where: where,
                include: [m[table.pl]]
            })
            .then(result => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error(`${table.si} not found`));
                };
            });
        });
    };
    function create(supplier_id, record, type, table) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get(supplier_id)
            .then(supplier => {
                m[table.pl].findOrCreate({
                    where:    record,
                    defaults: {type: type}
                })
                .then(([result, created]) => {
                    let create_record = {supplier_id: supplier.supplier_id};
                    create_record[`${table.si}_id`] = result[`${table.si}_id`];
                    m[`supplier_${table.pl}`].create(create_record)
                    .then(result => resolve(true))
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function edit(id, new_record, user_id, table) {
        return new Promise((resolve, reject) => {
            let where = {};
            where[`${table.si}`] = id;
            m[table.pl].findOne(where)
            .then(result => {
                if (result) {
                    result.update(new_record)
                    .then(result => {
                        if (result) {
                            fn.actions.create(
                                `${table.si.toUpperCase()} | UPDATED`,
                                user_id,
                                [{table: table.pl, id: result[`${table.si}_id`]}]
                            )
                            .then(result => resolve(true));
                        } else {
                            reject(new Error(`${table.si} not updated`))
                        };
                    })
                    .catch(err => reject(err));
                } else {
                    reject(new Error(`No ${table.si} for this record`));
                };
            })
            .catch(err => reject(err));
        });
    };
    function _delete(id, table) {
        return new Promise((resolve, reject) => {
            fn.suppliers[table.pl].get(id)
            .then(link => {
                let actions = [link.destroy()];
                if (link[table.si]) actions.push(link[table.si].destroy());
                Promise.all(actions)
                .then(result => resolve(true))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.suppliers.contacts.get    = function (supplier_contact_id) {
        return get(supplier_contact_id, {pl: 'contacts', si: 'contact'});
        // return new Promise((resolve, reject) => {
        //     m.supplier_contacts.findOne({
        //         where: {supplier_contact_id: supplier_contact_id},
        //         include: [m.contacts]
        //     })
        //     .then(contact => {
        //         if (contact) {
        //             resolve(contact);
        //         } else {
        //             reject(new Error('Contact not found'));
        //         };
        //     });
        // });
    };
    fn.suppliers.contacts.create = function (supplier_id, contact, type) {
        return create(supplier_id, contact, type, {pl: 'contacts', si: 'contact'});
        // return new Promise((resolve, reject) => {
        //     fn.suppliers.get(supplier_id)
        //     .then(supplier => {
        //         m.contacts.findOrCreate({
        //             where:    contact,
        //             defaults: {type: type}
        //         })
        //         .then(([contact, created]) => {
        //             m.supplier_contacts.create({
        //                 supplier_id: supplier.supplier_id,
        //                 contact_id: contact.contact_id
        //             })
        //             .then(supplier_contact => resolve(true))
        //             .catch(err => reject(err));
        //         })
        //         .catch(err => reject(err));
        //     })
        //     .catch(err => reject(err));
        // });
    };
    fn.suppliers.contacts.edit   = function (contact_id, new_contact, user_id) {
        return edit(contact_id, new_contact, user_id, {pl: 'contacts', si: 'contact'});
        // return new Promise((resolve, reject) => {
        //     m.contacts.findOne({where: {contact_id: contact_id}})
        //     .then(contact => {
        //         if (contact) {
        //             contact.update(new_contact)
        //             .then(result => {
        //                 if (result) {
        //                     fn.actions.create(
        //                         'CONTACT | UPDATED',
        //                         user_id,
        //                         [{table: 'contacts', id: contact.contact_id}]
        //                     )
        //                     .then(result => resolve(true));
        //                 } else {
        //                     reject(new Error('Contact not updated'))
        //                 };
        //             })
        //             .catch(err => reject(err));
        //         } else {
        //             reject(new Error('No contact for this record'));
        //         };
        //     })
        //     .catch(err => reject(err));
        // });
    };
    fn.suppliers.contacts.delete = function (supplier_contact_id) {
        return _delete(supplier_contact_id, {pl: 'contacts', si: 'contact'});
        // return new Promise((resolve, reject) => {
        //     fn.suppliers.contacts.get(supplier_contact_id)
        //     .then(link => {
        //         let actions = [link.destroy()];
        //         if (link.contact) actions.push(link.contact.destroy());
        //         Promise.all(actions)
        //         .then(result => resolve(true))
        //         .catch(err => reject(err));
        //     })
        //     .catch(err => reject(err));
        // });
    };

    fn.suppliers.addresses.get    = function (supplier_address_id) {
        return get(supplier_address_id, {pl: 'addresses', si: 'address'});
        // return new Promise((resolve, reject) => {
        //     m.supplier_addresses.findOne({
        //         where: {supplier_address_id: supplier_address_id},
        //         include: [m.addresses]
        //     })
        //     .then(address => {
        //         if (address) {
        //             resolve(address);
        //         } else {
        //             reject(new Error('Address not found'));
        //         };
        //     });
        // });
    };
    fn.suppliers.addresses.create = function (supplier_id, address, type) {
        return create(supplier_id, address, type, {pl: 'addresses', si: 'address'});
        // return new Promise((resolve, reject) => {
        //     fn.suppliers.get(supplier_id)
        //     .then(supplier => {
        //         m.addresses.findOrCreate({
        //             where:    address,
        //             defaults: {type: type}
        //         })
        //         .then(([address, created]) => {
        //             m.supplier_addresses.create({
        //                 supplier_id: supplier.supplier_id,
        //                 address_id: address.address_id
        //             })
        //             .then(supplier_address => resolve(true))
        //             .catch(err => reject(err));
        //         })
        //         .catch(err => reject(err));
        //     })
        //     .catch(err => reject(err));
        // });
    };
    fn.suppliers.addresses.edit   = function (address_id, new_address, user_id) {
        return edit(address_id, new_address, user_id, {pl: 'addresses', si: 'address'});
        // return new Promise((resolve, reject) => {
        //     m.addresses.findOne({where: {address_id: address_id}})
        //     .then(address => {
        //         if (address) {
        //             address.update(new_address)
        //             .then(result => {
        //                 if (result) {
        //                     fn.actions.create(
        //                         'ADDRESS | UPDATED',
        //                         user_id,
        //                         [{table: 'addresses', id: address.address_id}]
        //                     )
        //                     .then(result => resolve(true));
        //                 } else {
        //                     reject(new Error('Address not updated'))
        //                 };
        //             })
        //             .catch(err => reject(err));
        //         } else {
        //             reject(new Error('No address for this record'));
        //         };
        //     })
        //     .catch(err => reject(err));
        // });
    };
    fn.suppliers.addresses.delete = function (supplier_address_id) {
        return _delete(supplier_address_id, {pl: 'addresses', si: 'address'});
        // return new Promise((resolve, reject) => {
        //     fn.suppliers.addresses.get(supplier_address_id)
        //     .then(link => {
        //         let actions = [link.destroy()];
        //         if (link.address) actions.push(link.address.destroy());
        //         Promise.all(actions)
        //         .then(result => resolve(true))
        //         .catch(err => reject(err));
        //     })
        //     .catch(err => reject(err));
        // });
    };
};