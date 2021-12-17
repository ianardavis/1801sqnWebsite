function addContactDeleteBtn(supplier_contact_id) {
    clear('contact_delete_btn')
    .then(contact_delete_btn => {
        get({
            table: 'contact',
            where: {supplier_contact_id: supplier_contact_id}
        })
        .then(function ([contact, options]) {
            contact_delete_btn.appendChild(
                new Delete_Button({
                    path: `/contacts/${contact.supplier_contact_id}`,
                    descriptor: 'contact',
                    options: {
                        onComplete: [
                            getContacts,
                            function () {modalHide('contact_view')}
                        ]
                    }
                }).e
            );
        });
    });
};
window.addEventListener('load', function () {
    modalOnShow('contact_view', function (event) {addContactDeleteBtn(event.relatedTarget.dataset.id)});
});