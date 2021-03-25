function getSales() {
    get(
        {
            table: 'sale_lines',
            query: [`item_id=${path[3]}`]
        },
        function (lines, options) {
            try {
                clearElement('tbl_sales');
                let table_body     = document.querySelector('#tbl_sales'),
                    sale_count = document.querySelector('#sale_count');
                    sale_count.innerText = lines.length || '0';
                lines.forEach(line => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, table_date(line.createdAt));
                    add_cell(row, {text: line._qty});
                    add_cell(row, {append: new Link({
                        href: `/canteen/sales/${line.sale_id}`,
                        small: true
                    }).e});
                });
            } catch (error) {
                console.log(error);
            };
        }
    )
};
document.querySelector('#reload').addEventListener('click', getSales);