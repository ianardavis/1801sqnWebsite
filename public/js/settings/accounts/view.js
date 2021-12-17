function getAccounts() {
    clear('tbl_accounts')
    .then(tbl_accounts => {
        get({
            table: 'accounts'
        })
        .then(function ([accounts, options]) {
            accounts.forEach(account => {
                let row = tbl_accounts.insertRow(-1);
                add_cell(row, {text: account.name});
                add_cell(row, {text: account.number});
                add_cell(row, {text: print_user(account.user)});
                add_cell(row, {append: 
                    new Button({
                        classes: ['accounts'],
                        modal:   'account_view',
                        data: [{
                            field: 'id',
                            value: account.account_id
                        }],
                        small: true
                    }).e
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
window.addEventListener('load', function () {
    modalOnShow('account_view', function (event) {viewAccount(event.relatedTarget.dataset.id)});
});