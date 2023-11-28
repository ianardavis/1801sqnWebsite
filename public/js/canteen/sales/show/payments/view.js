function getPayments() {
    clear('tbl_payments')
    .then(tbl_payments => {
        get({
            table: 'payments',
            where: {sale_id: path[2]},
            func: getPayments
        })
        .then(function ([result, options]) {
            setCount('payment', result.count);
            result.payments.forEach(payment => {
                try {
                    let row = tbl_payments.insertRow(-1);
                    addCell(row, tableDate(payment.createdAt));
                    addCell(row, {text: `£${Number(payment.amount).toFixed(2)}`});
                    addCell(row, {text: payment.type});
                    addCell(row, {text: printUser(payment.user)});
                } catch (error) {
                    console.error(`canteen/sales/show/payments/view.js | getPayments | ${error}`);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getPayments);
});