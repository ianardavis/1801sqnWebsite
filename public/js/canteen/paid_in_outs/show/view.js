let statuses = {'0': 'Cancelled', '1': 'Entered', '2': 'Complete'};
function getPaidInOut() {
    get({
        table: 'paid_in_out',
        query: [`"paid_in_out_id":"${path[2]}"`]
    })
    .then(function ([paid_in_out, options]) {
        set_breadcrumb({text: paid_in_out.paid_in_out_id});
        set_innerText({id: 'paid_in_out_paid_in',          value: (paid_in_out.paid_in ? 'In' : 'Out')});
        set_innerText({id: 'paid_in_out_holding',          value: paid_in_out.holding.description});
        set_innerText({id: 'paid_in_out_user_paid_in_out', value: print_user(paid_in_out.user_paid_in_out)});
        set_innerText({id: 'paid_in_out_amount',           value: `£${Number(paid_in_out.amount).toFixed(2)}`});
        set_innerText({id: 'paid_in_out_reason',           value: paid_in_out.reason});
        set_innerText({id: 'paid_in_out_status',           value: statuses[paid_in_out.status] || 'Unknown'});
        set_innerText({id: 'paid_in_out_user',             value: print_user(paid_in_out.user)});
        set_innerText({id: 'paid_in_out_createdAt',        value: print_date(paid_in_out.createdAt)});
        set_innerText({id: 'paid_in_out_updatedAt',        value: print_date(paid_in_out.updatedAt)});
        set_href({id: 'paid_in_out_holding_link',          value: `/holdings/${paid_in_out.holding_id}`});
        set_href({id: 'paid_in_out_user_paid_in_out_link', value: `/users/${paid_in_out.user_id_paid_in_out}`});
        set_href({id: 'paid_in_out_user',                  value: `/users/${paid_in_out.user_id}`});
        if (typeof editBtnStatus   === 'function') editBtnStatus(paid_in_out.status);
        if (typeof deleteBtnStatus === 'function') deleteBtnStatus(paid_in_out.status);
    });
};