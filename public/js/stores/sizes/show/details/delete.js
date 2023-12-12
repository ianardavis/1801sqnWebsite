function addDetailDeleteBtn(event) {
    setAttribute('detail_id_delete', 'value', event.relatedTarget.dataset.id);
};
window.addEventListener('load', function () {
    enableButton('detail_delete');
    addFormListener(
        'detail_delete',
        'DELETE',
        '/details',
        {
            onComplete: [
                getDetails,
                function () {modalHide('detail_view')}
            ]
        }
    );
    modalOnShow('detail_view', addDetailDeleteBtn);
});