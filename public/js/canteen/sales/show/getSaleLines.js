function getSaleLines() {
    get(
        {
            table: 'sale_lines',
            query: [`sale_id=${path[3]}`]
        },
        function (lines, options) {
            try {
                clearElement('tbl_lines');
                let table_body = document.querySelector('#tbl_lines'),
                    line_count = document.querySelector('#line_count');
                line_count.innerText = lines.length || '0';
                lines.forEach(line => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, table_date(line.createdAt));
                    add_cell(row, {text: line.item._name});
                    add_cell(row, {text: line._qty});
                    add_cell(row, {text: `£${Number(line.item._price).toFixed(2)}`});
                    add_cell(row, {text: `£${Number(line.item._price*line._qty).toFixed(2)}`});
                });
            } catch (error) {
                console.log(error);
            };
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSaleLines);