function resetAddPaidInOut() {
    getHoldings();
    getUsers();
    setValue('paid_in_out_paid_in', '1');
    setValue('paid_in_out_reason');
    setValue('paid_in_out_amount');
};
function getHoldings() {
    listHoldings({
        select:     'sel_holdings',
        blank:      true,
        blank_text: 'Select Holding...',
        table:      'holdings',
        id_only:    true
    });
};
function getUsers() {
    listUsers({
        blank: {text: 'Select User...'},
        location: 'users/current'
    });
};
window.addEventListener('load', function () {
    modalOnShow('paid_in_out_add', resetAddPaidInOut);
    addFormListener(
        'paid_in_out_add',
        'POST',
        '/paid_in_outs',
        {
            onComplete: [
                resetAddPaidInOut,
                getPaidInOuts
            ]
        }
    )
});