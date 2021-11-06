function getPayments() {
    clear('tbl_payments')
    .then(tbl_payments => {
        let sort_cols = tbl_payments.parentNode.querySelector('.sort') || null;
        get({
            table: 'payments',
            query: [`sale_id=${path[2]}`],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([payments, options]) {
            set_count({id: 'payment', count: payments.length || '0'});
            payments.forEach(payment => {
                try {
                    let row = tbl_payments.insertRow(-1);
                    add_cell(row, table_date(payment.createdAt));
                    add_cell(row, {text: `£${Number(payment.amount).toFixed(2)}`});
                    add_cell(row, {text: payment.type});
                    add_cell(row, {text: print_user(payment.user)});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
addReloadListener(getPayments);