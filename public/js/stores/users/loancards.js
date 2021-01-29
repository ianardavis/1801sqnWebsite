let loancard_statuses = {'0': 'Cancelled', '1':'Draft', '2': 'Open', '3': 'Closed'};
function getLoancards () {
    let sel_status = document.querySelector('#sel_status_loancards') || {value: ''};
    get(
        function (loancards, options) {
            set_count({id: 'loancards', count: loancards.length || '0'})
            let table_body = document.querySelector('#tbl_loancards');
            if (table_body) {
                table_body.innerHTML = '';
                loancards.forEach(loancard => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, table_date(loancard.createdAt));
                    add_cell(row, {text: loancard.lines.length || '0'});
                    add_cell(row, {text: loancard_statuses[loancard._status]})
                    add_cell(row, {
                        append: new Link({
                            href: `/stores/loancards/${loancard.loancard_id}`,
                            small: true
                        }).e
                    });
                });
            };
        },
        {
            table: 'loancards',
            query: [`user_id_loancard=${path[3]}`, sel_status.value]
        }
    );
};
document.querySelector('#reload')              .addEventListener('click',  getLoancards);
document.querySelector('#sel_status_loancards').addEventListener('change', getLoancards);