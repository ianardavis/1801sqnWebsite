function getAccount() {
    get(
        {
            table: 'account',
            query:[`account_id=${path[3]}`]
        },
        function (account, options) {
            for (let [id, value] of Object.entries(account)) {
                try {
                    let element = document.querySelector(`#${id}`);
                    if (id === 'user') {
                        element = document.querySelector('#_user');
                        if (element) element.innerText = `${value.rank._rank} ${value.full_name}`;
                    } else if (element) {
                        element.innerText = value;
                    };
                } catch (error) {console.log(error)};
            };
            let edit_link = document.querySelector('#edit_link');
            if (edit_link) edit_link.href = `javascript:edit("accounts",${account.account_id})`;
        }
    );
};
document.querySelector('#reload').addEventListener('click', () => getAccount);