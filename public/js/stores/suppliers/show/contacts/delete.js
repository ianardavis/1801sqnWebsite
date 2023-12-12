function addContactDeleteBtn(event) {
    setAttribute('contact_id_delete', 'value', event.relatedTarget.dataset.id);
};
window.addEventListener('load', function () {
    enableButton('contact_delete');
    addFormListener(
        'contact_delete',
        'DELETE',
        '/contacts',
        {
            onComplete: [
                getContacts,
                function () {modalHide('contact_view')}
            ]
        }
    );
    modalOnShow('contact_view', addContactDeleteBtn);
});