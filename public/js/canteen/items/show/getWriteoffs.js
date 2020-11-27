function getWriteoffs() {
    get(
        function (lines, options) {
            try {
                clearElement('tbl_writeoffs');
                let tbl_writeoffs  = document.querySelector('#tbl_writeoffs'),
                    writeoff_count = document.querySelector('#writeoff_count');
                writeoff_count.innerText = lines.length || '0';
                lines.forEach(line => {
                    let row = tbl_writeoffs.insertRow(-1);
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
            } catch (error) {
                console.log(error);
            };
        },
        {
            db: 'canteen',
            table: 'writeoff_lines',
            query: [`item_id=${path[3]}`]
        }
    )
};
document.querySelector('#reload').addEventListener('click', getWriteoffs);