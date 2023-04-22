function getPayments() {
    clear('tbl_payments')
    .then(tbl_payments => {
        get({
            table: 'payments',
            where: {sale_id: path[2]},
            func: getPayments
        })
        .then(function ([result, options]) {
            set_count('payment', result.count);
            result.payments.forEach(payment => {
                try {
                    let row = tbl_payments.insertRow(-1);
                    add_cell(row, table_date(payment.createdAt));
                    add_cell(row, {text: `£${Number(payment.amount).toFixed(2)}`});
                    add_cell(row, {text: payment.type});
                    add_cell(row, {text: print_user(payment.user)});
                } catch (error) {
                    console.error(error);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getPayments);
});