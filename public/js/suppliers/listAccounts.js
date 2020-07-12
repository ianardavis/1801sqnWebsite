listAccounts = (accounts, options = {}) => {
    if (accounts.length > 0) {
        let _select  = document.querySelector('#accountsSelect');
        _select.innerHTML = '';
        _select.appendChild(new Option({value: '', text: ''}).option);
        accounts.forEach(account => {
            _select.appendChild(
                new Option({
                    value: account.account_id,
                    text:  account._name,
                    selected: (options.selected === account.account_id)
                }).option
            )
        });
    } else alert('No accounts found');
};