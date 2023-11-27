function viewAccount(account_id) {
    get({
        table: 'account',
        where: {account_id: account_id}
    })
    .then(function ([account, options]) {
        setInnerText('account_id',        account.account_id);
        setInnerText('account_name',      account.name);
        setInnerText('account_number',    account.number);
        setInnerText('account_user',      print_user(account.user));
        setInnerText('account_createdAt', print_date(account.createdAt, true));
        setInnerText('account_updatedAt', print_date(account.updatedAt, true));
        setHREF('account_user_link', `/users/${account.user_id}`);
    });
};
window.addEventListener('load', function () {
    modalOnShow('account_view', function (event) {viewAccount(event.relatedTarget.dataset.id)});
});