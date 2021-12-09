function accountEditBtn(account_id) {
    clear('account_edit')
    .then(span_edit => {
        span_edit.appendChild(
            new Link({
                modal: 'account_edit',
                type: 'edit',
                data:  {field: 'id', value: account_id},
                large: true
            }).e
        );
    })
};
function viewAccountEdit(account_id) {
    modalHide('account_view');
    get({
        table: 'account',
        query: [`"account_id":"${account_id}"`]
    })
    .then(function([account, options]) {
        set_value('account_id_edit',     account.account_id);
        set_value('account_name_edit',   account.name);
        set_value('account_number_edit', account.number);
        listUsers({
            select:   'sel_account_user_edit',
            id_only:  true,
            selected: account.user_id_account
        })
    });
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