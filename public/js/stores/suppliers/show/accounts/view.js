function viewAccount(account_id) {
    get({
        table: 'account',
        query: [`"account_id":"${account_id}"`]
    })
    .then(function ([account, options]) {
        set_innerText('account_id',        account.account_id);
        set_innerText('account_name',      account.name);
        set_innerText('account_number',    account.number);
        set_innerText('account_user',      print_user(account.user));
        set_innerText('account_createdAt', print_date(account.createdAt, true));
        set_innerText('account_updatedAt', print_date(account.updatedAt, true));
        set_href('account_user_link', `/users/${account.user_id}`);
    });
};
window.addEventListener('load', function () {
    modalOnShow('account_view', function (event) {viewAccount(event.relatedTarget.dataset.id)});
});