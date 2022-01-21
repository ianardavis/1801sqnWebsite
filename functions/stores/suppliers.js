module.exports = function (m, fn) {
    fn.suppliers = {contacts: {}, addresses: {}};
    fn.suppliers.get = function (supplier_id) {
        return fn.get('suppliers', {supplier_id: supplier_id})
    };
    fn.suppliers.contacts.get = function (supplier_contact_id) {
        return fn.get(
            'supplier_contacts',
            {supplier_contact_id: supplier_contact_id},
            [m.contacts]
        )
    };
    fn.suppliers.addresses.get = function (supplier_address_id) {
        return fn.get(
            'supplier_addresses',
            {supplier_address_id: supplier_address_id},
            [m.addresses]
        )
    };
};