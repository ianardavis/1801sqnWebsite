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
                        function () {$('#mdl_account_view').modal('hide')}
                    ]
                }
            }).e
        );
    };
};
window.addEventListener('load', function () {
    $('#mdl_account_view').on('show.bs.modal', function (event) {accountDeleteBtn(event.relatedTarget.dataset.id)});
});