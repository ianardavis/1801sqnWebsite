function reset_add_paid_in_out() {
    getHoldings();
    getUsers();
    set_value('paid_in_out_paid_in', '1');
    set_value('paid_in_out_reason');
    set_value('paid_in_out_amount');
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
        table: 'users_current'
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