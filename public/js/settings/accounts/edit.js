function accountEditBtn(account_id) {
    clear('account_edit')
    .then(span_edit => {
        span_edit.appendChild(
            new Modal_Button(
                _search(),
                'account_edit',
                [{field: 'id', value: account_id}],
                false
            ).e
        );
    })
};
function viewAccountEdit(account_id) {
    modalHide('account_view');
    get({
        table: 'account',
        where: {account_id: account_id}
    })
    .then(function([account, options]) {
        setValue('account_id_edit',     account.account_id);
        setValue('account_name_edit',   account.name);
        setValue('account_number_edit', account.number);
        listUsers({
            select:   'sel_account_user_edit',
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