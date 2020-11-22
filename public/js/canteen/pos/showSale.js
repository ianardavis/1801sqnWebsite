function showSale(sale_id, options) {
    if (sale_id) {
        window.getSaleLines = function() {
            get(
                showSaleLines,
                {
                    db: 'canteen',
                    table: 'sale_lines',
                    query: [`sale_id=${sale_id}`]
                }
            );
        };
        let sale_id_fields = document.querySelectorAll('.sale_id'),
            breadcrumb     = document.querySelector('#breadcrumb'),
            tbl_sale_lines = document.querySelector('#tbl_sale_lines');
        tbl_sale_lines.innerHTML = '';
        addFormListener(
            'form_complete_sale',
            'PUT',
            '/canteen/sales',
            {
                noConfirm: true,
                onComplete: [
                    window.getSale,
                    function (response) {
                        let change   = document.querySelector('#change'),
                            close    = document.querySelector('#btn_close_complete_sale'),
                            complete = document.querySelector('#btn_complete_sale');
                        close.classList.remove('hidden');
                        complete.classList.add('hidden');
                        change.innerText = `£${Number(response.change).toFixed(2)}`;
                    },
                    getCredits,
                    getUsers
                ]
            }
        );
        breadcrumb.innerText = sale_id;
        sale_id_fields.forEach(field => {
            field.setAttribute('value', sale_id);
        });
        getSaleLines();
        
    } else alert('Sale not found');
};