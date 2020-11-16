showAccount = (accounts, na) => {
    if (accounts.length === 1) {
        for (let [id, value] of Object.entries(accounts[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (element) element.value = value;
            } catch (error) {console.log(error)};
        };
        get(showUsers, {table: 'users', query:['status_id=2'], selected: accounts[0].user_id});
    } else alert(`${accounts.length} matching accounts found`);
};