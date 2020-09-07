showRequests = (lines, options) => {
    let table_body    = document.querySelector('#requestTable'),
        request_count = document.querySelector('#request_count');
    if (lines) request_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(line.request._date).getTime(),
            text: new Date(line.request._date).toDateString()
        });
        add_cell(row, {text: line.size.item._description});
        add_cell(row, {text: line.size._size});
        add_cell(row, {text: line._qty});
        add_cell(row, {text: line._status});
        add_cell(row, {
            append: new Link({
                href: '/stores/requests/' + line.request_id,
                small: true
            }).link
        });
    });
    hide_spinner('request_lines');
};