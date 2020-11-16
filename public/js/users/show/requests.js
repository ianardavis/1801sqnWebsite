var request_statuses = {'0': 'Cancelled', '1': 'Pending', '2': 'Open', '3':'Approved', '4':'Declined'};
showRequests = (lines, options) => {
    let table_body    = document.querySelector('#requestTable'),
        request_count = document.querySelector('#request_count');
    if (lines) request_count.innerText = lines.length || '0';
    table_body.innerHTML = '';
    lines.forEach(line => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(line.createdAt).getTime(),
            text: print_date(line.createdAt)
        });
        add_cell(row, {text: line.size.item._description});
        add_cell(row, {text: line.size._size});
        add_cell(row, {text: line._qty});
        add_cell(row, {text: request_statuses[String(line._status)]});
        add_cell(row, {
            append: new Link({
                href: '/stores/requests/' + line.request_id,
                small: true
            }).e
        });
    });
    hide_spinner('request_lines');
};