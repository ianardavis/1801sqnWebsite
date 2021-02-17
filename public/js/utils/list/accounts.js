function listAccounts(options = {}) {
    get(
        {
            table: 'accounts',
            ...options
        },
        function (accounts, options) {
            let sel_accounts  = document.querySelector(`#${options.select ||'sel_accounts'}`);
            if (sel_accounts) {
                sel_accounts.innerHTML = '';
                sel_accounts.appendChild(new Option({text: '---None---', selected: (options.selected === null)}).e);
                accounts.forEach(account => {
                    sel_accounts.appendChild(
                        new Option({
                            value:    account.account_id,
                            text:     print_account(account),
                            selected: (options.selected === account.account_id)
                        }).e
                    )
                });
            };
        }
    );
};