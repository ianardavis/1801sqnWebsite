window.addEventListener('load', function () {
    remove_attribute({id: 'btn_account_add', attribute: 'disabled'});
    addFormListener(
        'account_add',
        'POST',
        '/stores/accounts',
        {
            onComplete: [
                getAccounts,
                function () {$('#mdl_account_add').modal('hide')}
            ]
        }
    );
    $('#mdl_account_add').on('show.bs.modal', function (event) {
        listUsers({
            select:    'sel_account_user_add',
            id_only:   true,
            blank:     true,
            blank_opt: {text: '... Select Owner', selected: true}
        })
    });
});