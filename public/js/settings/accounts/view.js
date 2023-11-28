function getAccounts() {
    clear('tbl_accounts')
    .then(tbl_accounts => {
        get({
            table: 'accounts'
        })
        .then(function ([results, options]) {
            results.accounts.forEach(account => {
                let row = tbl_accounts.insertRow(-1);
                addCell(row, {text: account.name});
                addCell(row, {text: account.number});
                addCell(row, {text: printUser(account.user)});
                addCell(row, {append: 
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
        setInnerText('account_user',      printUser(account.user));
        setInnerText('account_createdAt', printDate(account.createdAt, true));
        setInnerText('account_updatedAt', printDate(account.updatedAt, true));
        setHREF('account_user_link', `/users/${account.user_id}`);
    });
};
window.addEventListener('load', function () {
    addListener('reload', getAccounts);
    modalOnShow('account_view', function (event) {viewAccount(event.relatedTarget.dataset.id)});
    addSortListeners('accounts', getAccounts);
    getAccounts();
});