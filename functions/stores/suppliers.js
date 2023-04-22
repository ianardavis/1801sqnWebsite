module.exports = function (m, fn) {
    fn.suppliers = {contacts: {}, addresses: {}};

    fn.suppliers.get = function (where, include = []) {
        return fn.get(
            m.suppliers,
            where,
            [fn.inc.stores.account()].concat(include)
        );
    };
    fn.suppliers.get_all = function (where, pagination) {
        return new Promise((resolve, reject) => {
            m.suppliers.findAndCountAll({
                where: where,
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
        });
    };
    fn.suppliers.edit = function (supplier_id, details) {
        return new Promise((resolve, reject) => {
            fn.suppliers.get({supplier_id: supplier_id})
            .then(supplier => {
                fn.update(supplier, details)
                .then(result => resolve(true))
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.suppliers.create = function (supplier) {
        return new Promise((resolve, reject) => {
            supplier = fn.nullify(supplier);
            m.suppliers.create(supplier)
            .then(supplier => resolve(true))
            .catch(reject);
        });
    };

    fn.suppliers.delete = function (supplier_id) {
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
                    .catch(reject);
                })
                .catch(reject);
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
                            console.error(`fn.suppliers.delete: Setting not deleted`);
                            resolve(false);
                        
                        };
                    })
                    .catch(err => {
                        console.error(err);
                        resolve(false);
                    });
                })
                .catch(err => resolve(false));
            });
        };
        return new Promise((resolve, reject) => {
            delete_supplier(supplier_id)
            .then(delete_default_supplier)
            .then(setting_deleted => resolve(setting_deleted))
            .catch(reject);
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
    function get_all(table, where, pagination) {
        return new Promise((resolve, reject) => {
            table.findAndCountAll({
                include: [{
                    model: m.suppliers,
                    where: where
                }],
                ...pagination
            })
            .then(results => resolve(results))
            .catch(reject);
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
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        });
    };
    function edit(id, new_record, user_id, table) {
        return new Promise((resolve, reject) => {
            let where = {};
            where[`${table.si}`] = id;
            m[table.pl].findOne(where)
            .then(result => {
                if (result) {
                    fn.update(result, new_record)
                    .then(result => {
                        fn.actions.create([
                            `${table.si.toUpperCase()} | UPDATED`,
                            user_id,
                            [{_table: table.pl, id: result[`${table.si}_id`]}]
                        ])
                        .then(result => resolve(true));
                    })
                    .catch(reject);

                } else {
                    reject(new Error(`No ${table.si} for this record`));

                };
            })
            .catch(reject);
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
                .catch(reject);
            })
            .catch(reject);
        });
    };

    fn.suppliers.contacts.get = function (where) {
        return get(where, {pl: 'contacts', si: 'contact'});
    };
    fn.suppliers.contacts.get_all = function (where, pagination) {
        return get_all(m.contacts, where, pagination);
    };
    fn.suppliers.contacts.create = function (supplier_id, contact, type) {
        return create(supplier_id, contact, type, {pl: 'contacts', si: 'contact'});
    };
    fn.suppliers.contacts.edit = function (contact_id, new_contact, user_id) {
        return edit(contact_id, new_contact, user_id, {pl: 'contacts', si: 'contact'});
    };
    fn.suppliers.contacts.delete = function (supplier_contact_id) {
        return _delete({supplier_contact_id: supplier_contact_id}, {pl: 'contacts', si: 'contact'});
    };

    fn.suppliers.addresses.get = function (where) {
        return get(where, {pl: 'addresses', si: 'address'});
    };
    fn.suppliers.addresses.get_all = function (where, pagination) {
        return get_all(m.addresses, where, pagination);
    };
    fn.suppliers.addresses.create = function (supplier_id, address, type) {
        return create(supplier_id, address, type, {pl: 'addresses', si: 'address'});
    };
    fn.suppliers.addresses.edit = function (address_id, new_address, user_id) {
        return edit(address_id, new_address, user_id, {pl: 'addresses', si: 'address'});
    };
    fn.suppliers.addresses.delete = function (supplier_address_id) {
        return _delete({supplier_address_id: supplier_address_id}, {pl: 'addresses', si: 'address'});
    };
};