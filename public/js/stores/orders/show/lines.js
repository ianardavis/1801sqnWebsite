function getLines() {
    lines_loaded = false;
    let sel_status = document.querySelector('#sel_status') || {value: ''};
    get(
        function (lines, options) {
            set_count({id: 'line', count: lines.length || '0'});
            let table_body = document.querySelector('#tbl_lines');
            if (table_body) {
                table_body.innerHTML = '';
                lines.forEach(line => {
                    try {
                        let row = table_body.insertRow(-1);
                        add_cell(row, {text: line.size.item._description});
                        add_cell(row, {text: line.size._size});
                        add_cell(row, {text: line._qty});
                        if (
                            (line._status === 1 && line.order._status === 1) ||
                            (line._status === 2 && line.order._status === 2)
                        ) {
                            add_cell(row, {
                                text: line_statuses[line._status],
                                classes: ['actions'],
                                data: {
                                    field: 'line_id',
                                    value: line.line_id
                                }
                            })
                        } else add_cell(row, {text: line_statuses[line._status]});
                        add_cell(row, {append: 
                            new Link({
                                small: true,
                                modal: 'line_view',
                                data: {
                                    field: 'order_line_id',
                                    value: line.line_id
                                }
                            }).e
                        });
                    } catch (error) {
                        console.log(`Error loading line ${line.line_id}:`)
                        console.log(error);
                    };
                });
            };
            lines_loaded = true;
        },
        {
            table: 'order_lines',
            query: [`order_id=${path[3]}`, sel_status.value]
        }
    );
};
window.addEventListener('load', function () {
    document.querySelector('#reload')    .addEventListener('click',  getLines);
    document.querySelector('#sel_status').addEventListener('change', getLines);
    $('#mdl_line_view').on('show.bs.modal', function (event) {showLine(       'order', event.relatedTarget.dataset.order_line_id)});
    $('#mdl_line_view').on('show.bs.modal', function (event) {showLineActions('order', event.relatedTarget.dataset.order_line_id)});
});