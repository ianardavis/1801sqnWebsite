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
        set_innerText('account_id',        account.account_id);
        set_innerText('account_name',      account.name);
        set_innerText('account_number',    account.number);
        set_innerText('account_user',      print_user(account.user));
        set_innerText('account_createdAt', print_date(account.createdAt, true));
        set_innerText('account_updatedAt', print_date(account.updatedAt, true));
        set_href('account_user_link', `/users/${account.user_id}`);
    });
};
addReloadListener(getAccounts);
sort_listeners(
    'accounts',
    getAccounts,
    [
        {value: '["createdAt"]', text: 'Created'},
        {value: '["name"]',      text: 'Name', selected: true},
        {value: '["number"]',    text: 'Number', selected: true},
        {value: '["user_id"]',   text: 'Owner', selected: true}
    ]
);
window.addEventListener('load', function () {
    modalOnShow('account_view', function (event) {viewAccount(event.relatedTarget.dataset.id)});
});