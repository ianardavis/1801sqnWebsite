function getWriteoffs() {
    get(
        {
            table: 'writeoffs',
            query: [`item_id=${path[3]}`]
        },
        function (writeoffs, options) {
            set_count({id: 'writeoff', count: writeoffs.length || '0'});
            let tbl_writeoffs  = document.querySelector('#tbl_writeoffs');
            if (tbl_writeoffs) {
                tbl_writeoffs.innerHTML = '';
                writeoffs.forEach(writeoff => {
                    try {
                        let row = tbl_writeoffs.insertRow(-1);
                        add_cell(row, table_date(writeoff.createdAt));
                        add_cell(row, {text: writeoff._qty});
                        add_cell(row, {append: new Link({
                            href: `/canteen/writeoffs/${writeoff.writeoff_id}`,
                            small: true
                        }).e});
                    } catch (error) {
                        console.log(error);
                    };
                });
            };
        }
    )
};
document.querySelector('#reload').addEventListener('click', getWriteoffs);