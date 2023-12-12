function accountDeleteBtn(event) {
    setAttribute('account_id_delete', 'value', event.relatedTarget.dataset.id);
};
window.addEventListener('load', function () {
    enableButton('account_delete');
    addFormListener(
        'account_delete',
        'DELETE',
        '/accounts',
        {
            onComplete: [
                getAccounts,
                function () {modalHide('account_view')}
            ]
        }
    );
    modalOnShow('account_view', accountDeleteBtn);
});