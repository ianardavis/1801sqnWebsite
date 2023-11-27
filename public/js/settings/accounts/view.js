function getAccounts() {
    clear('tbl_accounts')
    .then(tbl_accounts => {
        get({
            table: 'accounts'
        })
        .then(function ([results, options]) {
            results.accounts.forEach(account => {
                let row = tbl_accounts.insertRow(-1);
                add_cell(row, {text: account.name});
                add_cell(row, {text: account.number});
                add_cell(row, {text: print_user(account.user)});
                add_cell(row, {append: 
                    new Modal_Button(
                        _search(),
                        'account_view',
                        [{
                            field: 'id',
                            value: account.account_id
                        }],
                        true,
                        {classes: ['accounts']}
                    ).e
                })
            });
            if (typeof AccountsEditBtns === 'function') accountsEditBtns();
        });
    });
};
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
    add_listener('reload', getAccounts);
    modalOnShow('account_view', function (event) {viewAccount(event.relatedTarget.dataset.id)});
    add_sort_listeners('accounts', getAccounts);
    getAccounts();
});