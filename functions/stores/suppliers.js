module.exports = function (m, fn) {
    fn.suppliers = {contacts: {}, addresses: {}};

    fn.suppliers.get = function (where, options = {}) {
        return new Promise((resolve, reject) => {
            m.suppliers.findOne({
                where: where,
                include: [
                    fn.inc.stores.account()
                ].concat(options.include || [])
            })
            .then(supplier => {
                if (supplier) {
                    resolve(...[supplier].concat(options.pass_on || []));

                } else {
                    reject(new Error('Supplier not found'));
                
                };
            })
            .catch(err => reject(err));
        });
    };
    fn.suppliers.getAll = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.suppliers.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    fn.suppliers.edit = function (supplier_id, details) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get({supplier_id: supplier_id})
            .then(supplier => {
                supplier.update(details)
                .then(result => resolve(result))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };

    fn.suppliers.create = function (supplier) {
        return new Promise((resolve, reject) => {
            supplier = fn.nullify(supplier);
            m.suppliers.create(supplier)
            .then(supplier => resolve(true))
            .catch(err => reject(err));
        });
    };

    function delete_supplier(supplier_id) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get({supplier_id: supplier_id})
            .then(supplier => {
                supplier.destroy()
                .then(result => {
                    if (result) {
                        resolve(supplier.supplier_id);

                    } else {
                        reject(new Error('Supplier not deleted'));

                    };
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    };
    function delete_default_supplier(supplier_id) {
        return new Promise(resolve => {
            fn.settings.get({
                name: 'default_supplier',
                value: supplier_id
            })
            .then(setting => {
                setting.destroy()
                .then(result => {
                    if (result) {
                        resolve(true);

                    } else {
                        console.log(`fn.suppliers.delete: Setting not deleted`);
                        resolve(false);
                    
                    };
                })
                .catch(err => {
                    console.log(err);
                    resolve(false);
                });
            })
            .catch(err => resolve(false));
        });
    };
    fn.suppliers.delete = function (supplier_id) {
        return new Promise((resolve, reject) => {
            delete_supplier(supplier_id)
            .then(delete_default_supplier)
            .then(setting_deleted => resolve(setting_deleted))
            .catch(err => reject(err));
        });
    };

    function get(where, table) {
        return new Promise((resolve, reject) => {
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
    function getAll(table, where, pagination) {
        return new Promise((resolve, reject) => {
            m[table].findAndCountAll({
                include: [{
                    model: m.suppliers,
                    where: where
                }],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(err => reject(err));
        });
    };
    function create(supplier_id, record, type, table) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get({supplier_id: supplier_id})
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
                                [{_table: table.pl, id: result[`${table.si}_id`]}]
                            )
                            .then(result => resolve(true));

                        } else {
                            reject(new Error(`${table.si} not updated`));

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
    function _delete(where, table) {
        return new Promise((resolve, reject) => {
            fn.suppliers[table.pl].get(where)
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

    fn.suppliers.contacts.get    = function (where) {
        return get(where, {pl: 'contacts', si: 'contact'});
    };
    fn.suppliers.contacts.getAll = function (query) {
        return getAll('contacts', query.where, fn.pagination(req.query));
    };
    fn.suppliers.contacts.create = function (supplier_id, contact, type) {
        return create(supplier_id, contact, type, {pl: 'contacts', si: 'contact'});
    };
    fn.suppliers.contacts.edit   = function (contact_id, new_contact, user_id) {
        return edit(contact_id, new_contact, user_id, {pl: 'contacts', si: 'contact'});
    };
    fn.suppliers.contacts.delete = function (supplier_contact_id) {
        return _delete({supplier_contact_id: supplier_contact_id}, {pl: 'contacts', si: 'contact'});
    };

    fn.suppliers.addresses.get    = function (where) {
        return get(where, {pl: 'addresses', si: 'address'});
    };
    fn.suppliers.addresses.getAll = function (query) {
        return getAll('addresses', query.where, fn.pagination(req.query));
    };
    fn.suppliers.addresses.create = function (supplier_id, address, type) {
        return create(supplier_id, address, type, {pl: 'addresses', si: 'address'});
    };
    fn.suppliers.addresses.edit   = function (address_id, new_address, user_id) {
        return edit(address_id, new_address, user_id, {pl: 'addresses', si: 'address'});
    };
    fn.suppliers.addresses.delete = function (supplier_address_id) {
        return _delete({supplier_address_id: supplier_address_id}, {pl: 'addresses', si: 'address'});
    };
};