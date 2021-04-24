function getContacts() {
    clear_table('contacts')
    .then(tbl_contacts => {
        get({
            table: 'contacts',
            query: [`supplier_id=${path[2]}`]
        })
        .then(function ([contacts, options]) {
            set_count({id: 'contact', count: contacts.length || '0'});
            contacts.forEach(contact => {
                let row = tbl_contacts.insertRow(-1);
                add_cell(row, {text: contact.contact.type});
                add_cell(row, {text: contact.contact.description});
                add_cell(row, {text: contact.contact.contact});
                add_cell(row, {append: new Button({
                    modal: 'contact_view',
                    data: {field: 'id', value: contact.supplier_contact_id},
                    small: true
                }).e});
            });
        });
    });
};
function viewContact(supplier_contact_id) {
    get({
        table: 'contact',
        query: [`supplier_contact_id=${supplier_contact_id}`],
        spinner: 'contact_view'
    })
    .then(function ([contact, options]) {
        set_innerText({id: 'supplier_contact_id', text: contact.supplier_contact_id});
        set_innerText({id: 'contact_id',          text: contact.contact_id});
        set_innerText({id: 'contact_type',        text: contact.contact.type});
        set_innerText({id: 'contact_description', text: contact.contact.description});
        set_innerText({id: 'contact_contact',     text: contact.contact.contact});
        set_innerText({id: 'contact_createdAt',   text: print_date(contact.contact.createdAt, true)});
        set_innerText({id: 'contact_updatedAt',   text: print_date(contact.contact.updatedAt, true)});
    });
};
addReloadListener(getContacts);
window.addEventListener('load', function () {
    $('#mdl_contact_view').on('show.bs.modal', function (event) {viewContact(event.relatedTarget.dataset.id)});
});