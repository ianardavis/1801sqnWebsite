function getPayments() {
    clear('tbl_payments')
    .then(tbl_payments => {
        get({
            table: 'payments_session',
            where: {session_id: path[2]},
            func: getPayments
        })
        .then(function ([results, options]) {
            setCount('payment', results.count);
            results.payments.forEach(payment => {
                let row = tbl_payments.insertRow(-1);
                add_cell(row, {text: payment.type});
                add_cell(row, {text: `£${Number(payment.amount).toFixed(2)}`});
                add_cell(row, {append: new Link(`/payments/${payment.payment_id}`).e});
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getPayments);
    add_sort_listeners('payments_session', getPayments);
    getPayments();
});