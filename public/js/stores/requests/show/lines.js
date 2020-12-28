var line_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3':'Approved', '4':'Declined'};
function getLines() {
    lines_loaded = false;
    let sel_status = document.querySelector('#sel_status');
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
                            (line._status === 1 && line.request._status === 1) ||
                            (line._status === 2 && line.request._status === 2)
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
                                    field: 'request_line_id',
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
            table: 'request_lines',
            query: [`request_id=${path[3]}`, sel_status.value]
        }
    );
};
function showLine(event) {
    get(
        function (request_line, options) {
            set_innerText({id: 'line_id_view',        text: request_line.line_id});
            set_innerText({id: 'line_item_view',      text: request_line.size.item._description});
            set_attribute({id: 'line_item_view_link', attribute: 'href', value: request_line.size.item_id});
            set_innerText({id: 'line_size_view',      text: request_line.size._size});
            set_attribute({id: 'line_size_view_link', attribute: 'href', value: request_line.size_id});
            set_innerText({id: 'line_qty_view',       text: request_line._qty});
            set_innerText({id: 'line_user_view',      text: print_user(request_line.user)});
            set_attribute({id: 'line_user_view_link', attribute: 'href', value: request_line.user_id});
            set_innerText({id: 'line_createdAt_view', text: print_date(request_line.createdAt, true)});
            set_innerText({id: 'line_updatedAt_view', text: print_date(request_line.updatedAt, true)});
        },
        {
            table: 'request_line',
            query: [`line_id=${event.relatedTarget.dataset.request_line_id}`]
        }
    );
};
function showLineActions(event) {
    get(
        function (actions, options) {
            set_count({id: 'line_actions', count: actions.length || '0'});
            let table_body = document.querySelector('#tbl_line_dates');
            if (table_body) {
                table_body.innerHTML = '';
                actions.forEach(e => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        text: print_date(e.createdAt, true),
                        sort: new Date(e.createdAt).getTime()
                    });
                    add_cell(row, {text: e._action});
                    add_cell(row, {
                        text: print_user(e.user),
                        append: new Link({
                            small: true,
                            float: true,
                            href:  `/stores/users/${e.user_id}`
                        }).e
                    });
                    if (e.action_line_id) {
                        add_cell(row, {
                            append: new Link({
                                small: true,
                                href:  `/stores/${e._action.toLowerCase()}_lines/${e.action_line_id}`
                            }).e
                        });
                    } else add_cell(row);

                });
            };
        },
        {
            table: 'request_line_actions',
            query: [`request_line_id=${event.relatedTarget.dataset.request_line_id}`]
        }
    );
};
window.addEventListener('load', function () {
    document.querySelector('#reload').addEventListener('click', getLines);
    document.querySelector('#sel_status').addEventListener('change', getLines);
    $('#mdl_line_view').on('show.bs.modal', showLine);
    $('#mdl_line_view').on('show.bs.modal', showLineActions);
});