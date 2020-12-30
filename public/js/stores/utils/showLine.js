function showLine(table, id) {
    get(
        function (line, options) {
            let span_view_buttons = document.querySelector('#span_view_buttons');
            if (span_view_buttons) {
                span_view_buttons.innerHTML = '';
                if (line._status === 1) {
                    span_view_buttons.appendChild(
                        new Delete_Button({
                            path: `/stores/${table}_lines/${line.line_id}`,
                            options: {
                                onComplete: [
                                    getLines,
                                    function () {$('#mdl_line_view').modal('hide')}
                                ]
                            }
                        }).e
                    );
                };
            };
            set_innerText({id: 'line_id_view',        text: line.line_id});
            set_innerText({id: 'line_item_view',      text: line.size.item._description});
            set_attribute({id: 'line_item_view_link', attribute: 'href', value: line.size.item_id});
            set_innerText({id: 'line_size_view',      text: line.size._size});
            set_attribute({id: 'line_size_view_link', attribute: 'href', value: line.size_id});
            set_innerText({id: 'line_qty_view',       text: line._qty});
            set_innerText({id: 'line_user_view',      text: print_user(line.user)});
            set_attribute({id: 'line_user_view_link', attribute: 'href', value: line.user_id});
            set_innerText({id: 'line_createdAt_view', text: print_date(line.createdAt, true)});
            set_innerText({id: 'line_updatedAt_view', text: print_date(line.updatedAt, true)});
        },
        {
            table: `${table}_line`,
            query: [`line_id=${id}`]
        }
    );
};