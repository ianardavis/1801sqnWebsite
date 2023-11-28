function viewAccount(account_id) {
    get({
        table: 'account',
        where: {account_id: account_id}
    })
    .then(function ([account, options]) {
        setInnerText('account_id',        account.account_id);
        setInnerText('account_name',      account.name);
        setInnerText('account_number',    account.number);
        setInnerText('account_user',      printUser(account.user));
        setInnerText('account_createdAt', printDate(account.createdAt, true));
        setInnerText('account_updatedAt', printDate(account.updatedAt, true));
        setHREF('account_user_link', `/users/${account.user_id}`);
    });
};
window.addEventListener('load', function () {
    modalOnShow('account_view', function (event) {viewAccount(event.relatedTarget.dataset.id)});
});