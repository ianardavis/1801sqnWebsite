window.addEventListener('load', function () {
    enableButton('account_add');
    addFormListener(
        'account_add',
        'POST',
        '/accounts',
        {
            onComplete: [
                getAccounts,
                function () {modalHide('account_add')}
            ]
        }
    );
    modalOnShow('account_add', function (event) {
        listUsers({
            select: 'sel_account_user_add',
            blank:  {text: '... Select Owner'}
        })
    });
});