function addContactDeleteBtn(supplier_contact_id) {
    let contact_delete_btn = document.querySelector('#contact_delete_btn');
    if (contact_delete_btn) {
        contact_delete_btn.innerHTML = '';
        get({
            table: 'contact',
            query: [`supplier_contact_id=${supplier_contact_id}`]
        })
        .then(function ([contact, options]) {
            contact_delete_btn.appendChild(
                new Delete_Button({
                    path: `/contacts/${contact.supplier_contact_id}`,
                    descriptor: 'contact',
                    options: {
                        onComplete: [
                            getContacts,
                            function () {$('#mdl_contact_view').modal('hide')}
                        ]
                    }
                }).e
            );
        });
    };
};
window.addEventListener('load', function () {
    $('#mdl_contact_view').on('show.bs.modal', function (event) {addContactDeleteBtn(event.relatedTarget.dataset.id)})
});