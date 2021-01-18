let statuses = {"0": "Cancelled", "1": "Open", "2": "Complete"};
function getWriteoffs() {
    let sel_status = document.querySelector('#sel_status');
    get(
        function (writeoffs, options) {
            clearElement('tbl_writeoffs');
            let table_body = document.querySelector('#tbl_writeoffs');
            writeoffs.forEach(writeoff => {
                let row = table_body.insertRow(-1);
                add_cell(row, table_date(writeoff.createdAt));
                add_cell(row, {text: print_user(writeoff.user)});
                add_cell(row, {text: writeoff._reason});
                add_cell(row, {text: statuses[writeoff._status]});
                add_cell(row, {append: new Link({
                    href: `/canteen/writeoffs/${writeoff.writeoff_id}`,
                    small: true
                }).e});
            });
        },
        {
            db: 'canteen',
            table: 'writeoffs',
            query: [sel_status.value]
        }
    );
};
document.querySelector('#sel_status').addEventListener('change', getWriteoffs);
document.querySelector('#reload').addEventListener('click', getWriteoffs);