let statuses = {'0': 'Cancelled', '1': 'Entered', '2': 'Complete'};
function getPaidInOut() {
    get({
        table: 'paid_in_out',
        query: [`"paid_in_out_id":"${path[2]}"`]
    })
    .then(function ([paid_in_out, options]) {
        set_breadcrumb(paid_in_out.paid_in_out_id);
        set_innerText('paid_in_out_paid_in',          (paid_in_out.paid_in ? 'In' : 'Out'));
        set_innerText('paid_in_out_holding',          paid_in_out.holding.description);
        set_innerText('paid_in_out_user_paid_in_out', print_user(paid_in_out.user_paid_in_out));
        set_innerText('paid_in_out_amount',           `£${Number(paid_in_out.amount).toFixed(2)}`);
        set_innerText('paid_in_out_reason',           paid_in_out.reason);
        set_innerText('paid_in_out_status',           statuses[paid_in_out.status] || 'Unknown');
        set_innerText('paid_in_out_user',             print_user(paid_in_out.user));
        set_innerText('paid_in_out_createdAt',        print_date(paid_in_out.createdAt));
        set_innerText('paid_in_out_updatedAt',        print_date(paid_in_out.updatedAt));
        set_href('paid_in_out_holding_link',          `/holdings/${paid_in_out.holding_id}`);
        set_href('paid_in_out_user_paid_in_out_link', `/users/${paid_in_out.user_id_paid_in_out}`);
        set_href('paid_in_out_user',                  `/users/${paid_in_out.user_id}`);
        if (typeof editBtnStatus   === 'function') editBtnStatus(paid_in_out.status);
        if (typeof deleteBtnStatus === 'function') deleteBtnStatus(paid_in_out.status);
    });
};