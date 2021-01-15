function listAccounts(accounts, options = {}) {
    get(
        function (accounts, options) {
            let sel_accounts  = document.querySelector('#sel_accounts');
            if (sel_accounts) {
                sel_accounts.innerHTML = '';
                sel_accounts.appendChild(new Option({value: '', text: ''}).e);
                accounts.forEach(account => {
                    sel_accounts.appendChild(
                        new Option({
                            value: account.account_id,
                            text:  account._name,
                            selected: (options.selected === account.account_id)
                        }).e
                    )
                });
            };
        },
        {
            table: 'accounts',
            query: []
        }
    )
};