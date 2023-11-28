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
                addCell(row, {text: payment.type});
                addCell(row, {text: `£${Number(payment.amount).toFixed(2)}`});
                addCell(row, {append: new Link(`/payments/${payment.payment_id}`).e});
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getPayments);
    addSortListeners('payments_session', getPayments);
    getPayments();
});