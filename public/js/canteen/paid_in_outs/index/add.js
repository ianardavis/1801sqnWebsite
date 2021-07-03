function reset_add_paid_in_out() {
    getHoldings();
    getUsers();
    set_value({id: 'paid_in_out_paid_in', value: '1'});
    set_value({id: 'paid_in_out_reason'});
    set_value({id: 'paid_in_out_amount'});
};
function getHoldings() {
    listHoldings({
        select:     'holdings',
        blank:      true,
        blank_text: 'Select Holding...',
        table:      'holdings',
        id_only:    true
    });
};
function getUsers() {
    listUsers({
        select:     'users',
        blank:      true,
        blank_text: 'Select User...',
        table:      'users_current',
        id_only:    true
    });
};
window.addEventListener('load', function () {
    modalOnShow('paid_in_out_add', reset_add_paid_in_out);
    addFormListener(
        'paid_in_out_add',
        'POST',
        '/paid_in_outs',
        {
            onComplete: [
                reset_add_paid_in_out,
                getPaidInOuts
            ]
        }
    )
});