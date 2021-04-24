window.addEventListener('load', function () {
    enable_button('account_add');
    addFormListener(
        'account_add',
        'POST',
        '/accounts',
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