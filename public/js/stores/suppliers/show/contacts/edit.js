function viewContactEdit(contact_id) {
    get({
        table: 'contact',
        where: {supplier_contact_id: contact_id}
    })
    .then(function ([contact, options]) {
        setAttribute('supplier_contact_id_edit', 'value', contact.supplier_contact_id);
        setValue('contact_type_edit',        contact.contact.type);
        setValue('contact_description_edit', contact.contact.description);
        setValue('contact_contact_edit',     contact.contact.contact);
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
                _edit(),
                'contact_edit',
                [{field: 'id', value: contact.supplier_contact_id}],
                false,
                {colour: 'warning'}
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