function accountEditBtn(account_id) {
    let span_edit = document.querySelector('#account_edit');
    if (span_edit) {
        span_edit.innerHTML = '';
        span_edit.appendChild(
            new Link({
                modal: 'account_edit',
                type: 'edit',
                data:  {field: 'id', value: account_id}
            }).e
        );
    };
};
function viewAccountEdit(account_id) {
    modalHide('account_view');
    get(
        {
            table: 'account',
            query: [`account_id=${account_id}`]
        },
        function(account, options) {
            set_attribute({id: 'account_id_edit', attribute: 'value', value: account.account_id});
            set_value({id: 'account_name_edit',   value: account._name});
            set_value({id: 'account_number_edit', value: account._number});
            listUsers({
                select:   'sel_account_user_edit',
                id_only:  true,
                selected: account.user_id_account
            })
        }
    );
};
window.addEventListener('load', function () {
    addFormListener(
        'account_edit',
        'PUT',
        '/accounts',
        {
            onComplete: [
                getAccounts,
                function () {modalHide('account_edit')}
            ]
        }
    );
    modalOnShow('account_edit', function (event) {viewAccountEdit(event.relatedTarget.dataset.id)});
    modalOnShow('account_view', function (event) {accountEditBtn(event.relatedTarget.dataset.id)});
});