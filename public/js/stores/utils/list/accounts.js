function listAccounts() {
    return new Promise((resolve, reject) => {
        get(
            function (accounts, options) {
                let sel_accounts  = document.querySelector('#sel_accounts');
                if (sel_accounts) {
                    sel_accounts.innerHTML = '';
                    sel_accounts.appendChild(new Option().e);
                    accounts.forEach(account => {
                        sel_accounts.appendChild(
                            new Option({
                                value: account.account_id,
                                text:  print_account(account),
                                selected: (options.selected === account.account_id)
                            }).e
                        )
                    });
                };
                resolve(true)
            },
            {
                table: 'accounts',
                query: [],
                onFail: [function(){reject(new Error('Error getting accounts'))}]
            }
        );
    });
};