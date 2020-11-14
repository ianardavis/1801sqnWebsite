showSupplier = suppliers => {
    if (suppliers.length === 1) {
        for (let [id, value] of Object.entries(suppliers[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (element) element.value = value;
            } catch (error) {console.log(error)};
        };
        let account_link = document.querySelector('#account_link');
        account_link.href = 'javascript:add("accounts")';
        get(listAccounts, {table: 'accounts', query: [], selected: suppliers[0].supplier_id});
    } else alert(`${suppliers.length} matching suppliers found`);
};