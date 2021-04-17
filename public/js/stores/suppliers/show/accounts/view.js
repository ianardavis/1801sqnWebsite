function viewAccount(account_id) {
    get(
        {
            table: 'account',
            query: [`account_id=${account_id}`]
        },
        function (account, options) {
            set_innerText({id: 'account_id_view',        text: account.account_id});
            set_innerText({id: '_name_account_view',     text: account._name});
            set_innerText({id: '_number_account_view',   text: account._number});
            set_innerText({id: 'user_account_view',      text: print_user(account.user_account)});
            set_attribute({id: 'user_account_view_link', attribute: 'href', value: `/users/${account.user_id_account}`});
            set_innerText({id: 'createdAt_account_view', text: print_date(account.createdAt, true)});
            set_innerText({id: 'updatedAt_account_view', text: print_date(account.updatedAt, true)});
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_account_view').on('show.bs.modal', function (event) {viewAccount(event.relatedTarget.dataset.id)});
});