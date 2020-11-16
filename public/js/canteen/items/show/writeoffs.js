showWriteoffs = (lines, options) => {
    try {
        let table_body     = document.querySelector('#tbl_writeoffs'),
            writeoff_count = document.querySelector('#writeoff_count');
        writeoff_count.innerText = lines.length || '0';
        table_body.innerHTML = '';
        lines.forEach(line => {
            let row = table_body.insertRow(-1);
            add_cell(row, {
                sort: new Date(line.createdAt).getTime(),
                text: print_date(line.createdAt)
            });
            add_cell(row, {text: line._qty});
            add_cell(row, {append: new Link({
                href: `/canteen/writeoffs/${line.writeoff_id}`,
                small: true
            }).e});
        });
        hide_spinner('writeoff_lines');
    } catch (error) {
        console.log(error);
    };
};