let statuses = {'0': 'Cancelled', '1': 'Entered', '2': 'Complete'};
function getPaidInOut() {
    get({
        table: 'paid_in_out',
        where: {paid_in_out_id: path[2]}
    })
    .then(function ([paid_in_out, options]) {
        setBreadcrumb(paid_in_out.paid_in_out_id);
        setInnerText('paid_in_out_paid_in',          (paid_in_out.paid_in ? 'In' : 'Out'));
        setInnerText('paid_in_out_holding',          paid_in_out.holding.description);
        setInnerText('paid_in_out_user_paid_in_out', printUser(paid_in_out.user_paid_in_out));
        setInnerText('paid_in_out_amount',           `£${Number(paid_in_out.amount).toFixed(2)}`);
        setInnerText('paid_in_out_reason',           paid_in_out.reason);
        setInnerText('paid_in_out_status',           statuses[paid_in_out.status] || 'Unknown');
        setInnerText('paid_in_out_user',             printUser(paid_in_out.user));
        setInnerText('paid_in_out_createdAt',        printDate(paid_in_out.createdAt));
        setInnerText('paid_in_out_updatedAt',        printDate(paid_in_out.updatedAt));
        setHREF('paid_in_out_holding_link',          `/holdings/${paid_in_out.holding_id}`);
        setHREF('paid_in_out_user_paid_in_out_link', `/users/${paid_in_out.user_id_paid_in_out}`);
        setHREF('paid_in_out_user',                  `/users/${paid_in_out.user_id}`);
        if (typeof editBtnStatus   === 'function') editBtnStatus(paid_in_out.status);
        if (typeof deleteBtnStatus === 'function') deleteBtnStatus(paid_in_out.status);
    });
};