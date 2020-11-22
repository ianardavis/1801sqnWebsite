showPayments = (payments, options) => {
    try {
        let table_body = document.querySelector('#tbl_payments'),
            payment_count = document.querySelector('#payment_count');
        payment_count.innerText = payments.length || '0';
        table_body.innerHTML = '';
        payments.forEach(payment => {
            let row = table_body.insertRow(-1);
            add_cell(row, {
                sort: new Date(payment.createdAt).getTime(),
                text: print_date(payment.createdAt, true)
            });
            add_cell(row, {text: `£${Number(payment._amount).toFixed(2)}`});
            add_cell(row, {text: payment._method});
            add_cell(row, {text: print_user(payment.user)});
        });
        hide_spinner('sale_payments');
    } catch (error) {
        console.log(error);
    };
};