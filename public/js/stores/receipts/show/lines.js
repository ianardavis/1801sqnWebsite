let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Closed'};
function getLines() {
    get(
        function(lines, options) {
            clearElement('tbl_lines');
            let table_body = document.querySelector('#tbl_lines');
            if (lines) document.querySelector('#line_count').innerText = lines.length || '0';
            lines.forEach(line => {
                try {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: line.size.item._description});
                    add_cell(row, {text: line.size._size});
                    add_cell(row, {text: line._qty});
                    add_cell(row, {text: line_statuses[String(line._status)]});
                    add_cell(row, {append: 
                        new Link({
                            small: true,
                            modal: 'line_view',
                            data: {
                                field: `receipt_line_id`,
                                value: line.line_id
                            }
                        }).e
                    });
                } catch (error) {
                    console.log(error)
                    console.log(`Error loading line ${line.line_id}: ${error}`)
                };
            });
        },
        {
            table: 'receipt_lines',
            query: [`receipt_id=${path[3]}`, sel_status.value]
        }
    );
};
document.querySelector('#reload')    .addEventListener('click',  getLines);
document.querySelector('#sel_status').addEventListener('change', getLines);