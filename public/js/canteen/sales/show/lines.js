showLines = (lines, options) => {
    try {
        let table_body = document.querySelector('#tbl_lines'),
            line_count = document.querySelector('#line_count');
        line_count.innerText = lines.length || '0';
        table_body.innerHTML = '';
        lines.forEach(line => {
            let row = table_body.insertRow(-1);
            add_cell(row, {
                sort: new Date(line.createdAt).getTime(),
                text: print_date(line.createdAt)
            });
            add_cell(row, {text: line.item._name});
            add_cell(row, {text: line._qty});
            add_cell(row, {text: `£${Number(line.item._price).toFixed(2)}`});
            add_cell(row, {text: `£${Number(line.item._price*line._qty).toFixed(2)}`});
        });
        hide_spinner('sale_lines');
    } catch (error) {
        console.log(error);
    };
};