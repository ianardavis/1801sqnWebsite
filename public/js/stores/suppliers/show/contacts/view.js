function getContacts() {
    clear('tbl_contacts')
    .then(tbl_contacts => {
        get({
            table: 'contacts',
            where: {supplier_id: path[2]},
            func: getContacts
        })
        .then(function ([result, options]) {
            setCount('contact', result.count);
            result.contacts.forEach(contact => {
                let row = tbl_contacts.insertRow(-1);
                addCell(row, {text: contact.type});
                addCell(row, {text: contact.description});
                addCell(row, {text: contact.contact});
                addCell(row, {append: new Modal_Button(
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
        setInnerText('supplier_contact_id', contact.supplier_contact_id);
        setInnerText('contact_id',          contact.contact_id);
        setInnerText('contact_type',        contact.contact.type);
        setInnerText('contact_description', contact.contact.description);
        setInnerText('contact_contact',     contact.contact.contact);
        setInnerText('contact_createdAt',   printDate(contact.contact.createdAt, true));
        setInnerText('contact_updatedAt',   printDate(contact.contact.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getContacts);
    modalOnShow('contact_view', function (event) {viewContact(event.relatedTarget.dataset.id)});
    addSortListeners('contacts', getContacts);
    getContacts();
});