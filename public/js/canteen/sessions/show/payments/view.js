function getPayments() {
    clear('tbl_payments')
    .then(tbl_payments => {
        get({
            table: 'payments_session',
            where: {session_id: path[2]},
            func: getPayments
        })
        .then(function ([results, options]) {
            set_count('payment', results.count);
            results.payments.forEach(payment => {
                let row = tbl_payments.insertRow(-1);
                add_cell(row, {text: payment.type});
                add_cell(row, {text: `£${Number(payment.amount).toFixed(2)}`});
                add_cell(row, {append: new Link({href: `/payments/${payment.payment_id}`}).e});
            });
        });
    });
};
addReloadListener(getPayments);
sort_listeners(
    'payments_session',
    getPayments,
    [
        {value: '["createdAt"]', text: 'Time', selected: true},
        {value: '["qty"]',       text: 'Qty'}
    ]
);