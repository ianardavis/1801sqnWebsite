function accountDeleteBtn(account_id) {
    let span_delete = document.querySelector('#account_delete');
    if (span_delete) {
        span_delete.innerHTML = '';
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
    };
};
window.addEventListener('load', function () {
    modalOnShow('account_view', function (event) {accountDeleteBtn(event.relatedTarget.dataset.id)});
});