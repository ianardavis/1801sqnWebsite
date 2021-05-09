function viewContactEdit(contact_id) {
    get({
        table:   'contact',
        query:   [`supplier_contact_id=${contact_id}`],
        spinner: 'contact_edit'
    })
    .then(function ([contact, options]) {
        set_attribute({id: 'supplier_contact_id_edit', attribute: 'value', value: contact.supplier_contact_id});
        set_value({id: 'contact_type_edit',        value: contact.contact.type});
        set_value({id: 'contact_description_edit', value: contact.contact.description});
        set_value({id: 'contact_contact_edit',     value: contact.contact.contact});
        modalHide('contact_view');
    })
    .catch(err => {
        modalHide('contact_edit');
    });
};
function addContactEditBtn(contact_id) {
    let contact_edit_btn = document.querySelector('#contact_edit_btn');
    if (contact_edit_btn) {
        contact_edit_btn.innerHTML = '';
        get({
            table: 'contact',
            query: [`supplier_contact_id=${contact_id}`]
        })
        .then(function ([contact, options]) {
            contact_edit_btn.appendChild(new Button({
                modal:   'contact_edit',
                data:    [{field: 'id', value: contact.supplier_contact_id}],
                type:    'edit',
            }).e);
        });
    };
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