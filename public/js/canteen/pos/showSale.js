function showSale(sale_id, options) {
    console.log(sale_id);
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
        addFormListener('form_complete_sale', 'PUT', `/canteen/sales${sale_id}`, {onComplete: [getSale]});
        breadcrumb.innerText = sale_id;
        sale_id_fields.forEach(field => {
            field.setAttribute('value', sale_id);
        });
        getSaleLines();
        
    } else alert('Sale not found');
};