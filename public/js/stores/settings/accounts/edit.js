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
    $('#mdl_account_view').modal('hide');
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
        '/stores/accounts',
        {
            onComplete: [
                getAccounts,
                function () {$('#mdl_account_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_account_edit').on('show.bs.modal', function (event) {viewAccountEdit(event.relatedTarget.dataset.id)});
    $('#mdl_account_view').on('show.bs.modal', function (event) {accountEditBtn(event.relatedTarget.dataset.id)});
});