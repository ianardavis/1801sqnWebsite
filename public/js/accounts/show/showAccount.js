showAccount = (accounts, na) => {
    if (accounts.length === 1) {
        for (let [id, value] of Object.entries(accounts[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (id === 'user') {
                    element = document.querySelector('#_user');
                    if (element) element.innerText = `${value.rank._rank} ${value.full_name}`;
                } else if (element) {
                    element.innerText = value;
                };
            } catch (error) {console.log(error)};
        };
        let edit_link = document.querySelector('#edit_link');
        if (edit_link) edit_link.href = `javascript:edit("accounts",${accounts[0].account_id})`;
    } else alert(`${accounts.length} matching accounts found`);
};