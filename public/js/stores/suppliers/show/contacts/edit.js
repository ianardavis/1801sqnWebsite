function viewContactEdit(contact_id) {
    get({
        table:   'contact',
        where:   {supplier_contact_id: contact_id},
        spinner: 'contact_edit'
    })
    .then(function ([contact, options]) {
        set_attribute('supplier_contact_id_edit', 'value', contact.supplier_contact_id);
        set_value('contact_type_edit',        contact.contact.type);
        set_value('contact_description_edit', contact.contact.description);
        set_value('contact_contact_edit',     contact.contact.contact);
        modalHide('contact_view');
    })
    .catch(err => {
        modalHide('contact_edit');
    });
};
function addContactEditBtn(contact_id) {
    clear('contact_edit_btn')
    .then(contact_edit_btn => {
        get({
            table: 'contact',
            where:   {supplier_contact_id: contact_id}
        })
        .then(function ([contact, options]) {
            contact_edit_btn.appendChild(new Modal_Button(
                _search(),
                'contact_edit',
                [{field: 'id', value: contact.supplier_contact_id}]
            ).e);
        });
    });
};
window.addEventListener('load', function() {
    addFormListener(
        'contact_edit',
        'PUT',
        `/contacts`,
        {
            onComplete: [
                getContacts,
                function () {modalHide('contact_edit')}
            ]
        }
    );
    modalOnShow('contact_view', function(event) {addContactEditBtn(event.relatedTarget.dataset.id)});
    modalOnShow('contact_edit', function(event) {
        viewContactEdit(event.relatedTarget.dataset.id);
        modalHide('contact_view');
    });
});