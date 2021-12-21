function listAccounts(options = {}) {
    clear('sel_accounts')
    .then(sel_accounts => {
        get({
            table: 'accounts',
            ...options
        })
        .then(function ([result, options]) {
            sel_accounts.appendChild(new Option({text: '---None---', selected: (options.selected === null)}).e);
            result.accounts.forEach(account => {
                sel_accounts.appendChild(
                    new Option({
                        value:    account.account_id,
                        text:     print_account(account),
                        selected: (options.selected === account.account_id)
                    }).e
                )
            });
        });
    })
};