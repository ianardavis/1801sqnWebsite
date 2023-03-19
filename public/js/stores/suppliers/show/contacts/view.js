function getContacts() {
    clear('tbl_contacts')
    .then(tbl_contacts => {
        get({
            table: 'contacts',
            where: {supplier_id: path[2]},
            func: getContacts
        })
        .then(function ([result, options]) {
            set_count('contact', result.count);
            result.contacts.forEach(contact => {
                let row = tbl_contacts.insertRow(-1);
                add_cell(row, {text: contact.type});
                add_cell(row, {text: contact.description});
                add_cell(row, {text: contact.contact});
                add_cell(row, {append: new Modal_Button(
                    _search(),
                    'contact_view',
                    [{field: 'id', value: contact.suppliers[0].supplier_contacts.supplier_contact_id}]
                ).e});
            });
        });
    });
};
function viewContact(supplier_contact_id) {
    get({
        table: 'contact',
        where: {supplier_contact_id: supplier_contact_id},
        spinner: 'contact_view'
    })
    .then(function ([contact, options]) {
        set_innerText('supplier_contact_id', contact.supplier_contact_id);
        set_innerText('contact_id',          contact.contact_id);
        set_innerText('contact_type',        contact.contact.type);
        set_innerText('contact_description', contact.contact.description);
        set_innerText('contact_contact',     contact.contact.contact);
        set_innerText('contact_createdAt',   print_date(contact.contact.createdAt, true));
        set_innerText('contact_updatedAt',   print_date(contact.contact.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getContacts);
    modalOnShow('contact_view', function (event) {viewContact(event.relatedTarget.dataset.id)});
    add_sort_listeners('contacts', getContacts);
    getContacts();
});