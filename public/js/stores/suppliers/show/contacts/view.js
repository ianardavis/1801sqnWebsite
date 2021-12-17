function getContacts() {
    clear('tbl_contacts')
    .then(tbl_contacts => {
        get({
            table: 'contacts',
            where: {supplier_id: path[2]}
        })
        .then(function ([contacts, options]) {
            set_count('contact', contacts.length);
            contacts.forEach(contact => {
                let row = tbl_contacts.insertRow(-1);
                add_cell(row, {text: contact.contact.type});
                add_cell(row, {text: contact.contact.description});
                add_cell(row, {text: contact.contact.contact});
                add_cell(row, {append: new Button({
                    modal: 'contact_view',
                    data: [{field: 'id', value: contact.supplier_contact_id}],
                    small: true
                }).e});
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
addReloadListener(getContacts);
window.addEventListener('load', function () {
    modalOnShow('contact_view', function (event) {viewContact(event.relatedTarget.dataset.id)});
});