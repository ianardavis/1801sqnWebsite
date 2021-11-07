function getPayments() {
    clear('tbl_payments')
    .then(tbl_payments => {
        let sort_cols = tbl_payments.parentNode.querySelector('.sort') || null;
        get({
            table: 'payments_session',
            query: [`"session_id":"${path[2]}"`],
            ...sort_query(sort_cols)
        })
        .then(function ([payments, options]) {
            set_count({id: 'payment', count: payments.length || '0'});
            payments.forEach(payment => {
                let row = tbl_payments.insertRow(-1);
                add_cell(row, {text: payment.type});
                add_cell(row, {text: `£${Number(payment.amount).toFixed(2)}`});
                add_cell(row,{
                    append: new Link({
                        href: `/payments/${payment.payment_id}`,
                        small: true
                    }).e
                });
            });
        });
    });
};
addReloadListener(getPayments);