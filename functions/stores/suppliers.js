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
    fn.suppliers.contacts.get = function (supplier_contact_id) {
        return m.supplier_contacts.findOne({
            where: {supplier_contact_id: supplier_contact_id},
            include: [m.contacts]
        });
    };
    fn.suppliers.addresses.get = function (supplier_address_id) {
        return m.supplier_addresses.findOne({
            where: {supplier_address_id: supplier_address_id},
            include: [m.addresses]
        });
    };
};