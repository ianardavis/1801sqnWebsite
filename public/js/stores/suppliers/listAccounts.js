listAccounts = (accounts, options = {}) => {
    if (accounts.length > 0) {
        clearElement('accountsSelect');
        let _select  = document.querySelector('#accountsSelect');
        _select.appendChild(new Option({value: '', text: ''}).e);
        accounts.forEach(account => {
            _select.appendChild(
                new Option({
                    value: account.account_id,
                    text:  account._name,
                    selected: (options.selected === account.account_id)
                }).e
            )
        });
    } else alert('No accounts found');
};