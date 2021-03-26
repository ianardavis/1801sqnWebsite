function getPayments() {
    get(
        {
            table: 'payments',
            query: [`sale_id=${path[2]}`]
        },
        function (payments, options) {
            try {
                clearElement('tbl_payments');
                let table_body = document.querySelector('#tbl_payments'),
                    payment_count = document.querySelector('#payment_count');
                payment_count.innerText = payments.length || '0';
                payments.forEach(payment => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, table_date(payment.createdAt));
                    add_cell(row, {text: `£${Number(payment._amount).toFixed(2)}`});
                    add_cell(row, {text: payment._type});
                    add_cell(row, {text: print_user(payment.user)});
                });
            } catch (error) {
                console.log(error);
            };
        }
    );
};
document.querySelector('#reload').addEventListener('click', getPayments);