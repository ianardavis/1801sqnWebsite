function viewAccount(account_id) {
    get({
        table: 'account',
        query: [`"account_id":"${account_id}"`]
    })
    .then(function ([account, options]) {
        set_innerText({id: 'account_id',        text: account.account_id});
        set_innerText({id: 'account_name',      text: account.name});
        set_innerText({id: 'account_number',    text: account.number});
        set_innerText({id: 'account_user',      text: print_user(account.user)});
        set_attribute({id: 'account_user_link', attribute: 'href', value: `/users/${account.user_id}`});
        set_innerText({id: 'account_createdAt', text: print_date(account.createdAt, true)});
        set_innerText({id: 'account_updatedAt', text: print_date(account.updatedAt, true)});
    });
};
window.addEventListener('load', function () {
    modalOnShow('account_view', function (event) {viewAccount(event.relatedTarget.dataset.id)});
});