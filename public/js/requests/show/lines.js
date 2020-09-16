showLines = (lines, options) => {
    let table_body = document.querySelector('#linesTable'),
        line_count = document.querySelector('#line_count');
    if (lines) line_count.innerText = lines.length;
    table_body.innerHTML = '';
    lines.forEach(line => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            text: line.size.item._description,
            append: new Link({href: `/stores/items/${line.size.item_id}`, small: true, float: true}).link
        });
        add_cell(row, {
            text: line.size._size,
            append: new Link({href: `/stores/sizes/${line.size_id}`, small: true, float: true}).link
        });
        add_cell(row, {text: line._qty});
        add_cell(row, {text: line._status});
    });
    hide_spinner('request_lines');
};