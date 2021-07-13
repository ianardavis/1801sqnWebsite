function accountDeleteBtn(account_id) {
    clear('account_delete')
    .then(span_delete => {
        span_delete.appendChild(
            new Delete_Button({
                descriptor: 'account',
                path:       `/accounts/${account_id}`,
                options: {
                    onComplete: [
                        getAccounts,
                        function () {modalHide('account_view')}
                    ]
                }
            }).e
        );
    });
};
window.addEventListener('load', function () {
    modalOnShow('account_view', function (event) {accountDeleteBtn(event.relatedTarget.dataset.id)});
});