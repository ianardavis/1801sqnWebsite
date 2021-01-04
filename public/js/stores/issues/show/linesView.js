let line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Issued', '3': 'Returned'};
function getLines() {
    get(
        function (lines, options) {
            let table_body = document.querySelector('#tbl_lines');
            set_count({id: 'line', count: lines.length || '0'})
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, {text: String(line.line_id).padStart(2, '0')});
                        add_cell(row, {text: line.size.item._description});
                        add_cell(row, {text: line.size._size});
                        add_cell(row, {text: line._qty});
                        add_cell(row, {text: line_statuses[line._status], id: `status_${line.line_id}`});
                        add_cell(row, {append: 
                            new Link({
                                small: true,
                                modal: 'line_view',
                                data: {
                                    field: `issue_line_id`,
                                    value: line.line_id
                                }
                            }).e
                        });
                    } catch (error) {
                        console.log(`Error loading line ${line.line_id}:`);
                        console.log(error);
                    };
                });
            };
        },
        {
            table: 'issue_lines',
            query: [`issue_id=${path[3]}`, sel_status.value]
        }
    );
};
document.querySelector('#reload')    .addEventListener('click',  getLines);
document.querySelector('#sel_status').addEventListener('change', getLines);