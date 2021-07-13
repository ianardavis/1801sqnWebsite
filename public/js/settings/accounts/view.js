function getAccounts() {
    clear('tbl_accounts')
    .then(tbl_accounts => {
        get({table: 'accounts'})
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
        query: [`account_id=${account_id}`]
    })
    .then(function ([account, options]) {
        set_innerText({id: 'account_id',        text: account.account_id});
        set_innerText({id: 'account_name',      text: account.name});
        set_innerText({id: 'account_number',    text: account.number});
        set_innerText({id: 'account_user',      text: print_user(account.user)});
        set_innerText({id: 'account_createdAt', text: print_date(account.createdAt, true)});
        set_innerText({id: 'account_updatedAt', text: print_date(account.updatedAt, true)});
        set_attribute({id: 'account_user_link', attribute: 'href', value: `/users/${account.user_id}`});
    });
};
addReloadListener(getAccounts);
window.addEventListener('load', function () {
    modalOnShow('account_view', function (event) {viewAccount(event.relatedTarget.dataset.id)});
});