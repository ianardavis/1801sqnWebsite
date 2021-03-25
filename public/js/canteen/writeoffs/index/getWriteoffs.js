let statuses = {"0": "Cancelled", "1": "Open", "2": "Complete"};
function getWriteoffs() {
    let sel_status = document.querySelector('#sel_status');
    get(
        {
            table: 'writeoffs',
            query: [sel_status.value]
        },
        function (writeoffs, options) {
            let tbl_writeoffs = document.querySelector('#tbl_writeoffs');
            if (tbl_writeoffs) {
                tbl_writeoffs.innerHTML = '';
                writeoffs.forEach(writeoff => {
                    let row = tbl_writeoffs.insertRow(-1);
                    add_cell(row, table_date(writeoff.createdAt));
                    add_cell(row, {text: print_user(writeoff.user)});
                    add_cell(row, {text: writeoff._reason});
                    add_cell(row, {text: statuses[writeoff._status]});
                    add_cell(row, {append: new Link({
                        href: `/canteen/writeoffs/${writeoff.writeoff_id}`,
                        small: true
                    }).e});
                });
            };
        }
    );
};
document.querySelector('#reload').addEventListener('click', getWriteoffs);