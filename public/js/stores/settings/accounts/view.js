function getAccounts() {
    let tbl_accounts = document.querySelector('#tbl_accounts');
    if (tbl_accounts) {
        tbl_accounts.innerHTML = '';
        get(
            {table: 'accounts'},
            function (accounts, options) {
                accounts.forEach(account => {
                    let row = tbl_accounts.insertRow(-1);
                    add_cell(row, {text: account.account_id});
                    add_cell(row, {text: account._name});
                    add_cell(row, {text: account._number});
                    add_cell(row, {text: print_user(account.user_account)});
                    add_cell(row, {append: 
                        new Link({
                            classes: ['accounts'],
                            modal:   'account_view',
                            data: {
                                field: 'id',
                                value: account.account_id
                            },
                            small: true
                        }).e
                    })
                });
                if (typeof AccountsEditBtns === 'function') accountsEditBtns();
            }
        );
    };
};
function viewAccount(account_id) {
    get(
        {
            table: 'account',
            query: [`account_id=${account_id}`]
        },
        function (account, options) {
            set_innerText({id: 'account_id_view',   text: account.account_id});
            set_innerText({id: 'account_name',      text: account._name});
            set_innerText({id: 'account_number',    text: account._number});
            set_innerText({id: 'account_user',      text: print_user(account.user_account)});
            set_innerText({id: 'account_createdAt', text: print_date(account.createdAt, true)});
            set_innerText({id: 'account_updatedAt', text: print_date(account.updatedAt, true)});
            set_attribute({id: 'account_user_link', attribute: 'href', value: `/users/${account.user_id}`});
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_account_view').on('show.bs.modal', function (event) {viewAccount(event.relatedTarget.dataset.id)});
    document.querySelector('#reload').addEventListener('click', getAccounts);
});