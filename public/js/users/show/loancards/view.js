let loancard_statuses = {'0': 'Cancelled', '1':'Draft', '2': 'Open', '3': 'Closed'};
function getLoancards () {
    clear_table('loancards')
    .then(tbl => {
        let sel_status = document.querySelector('#sel_status_loancards') || {value: ''};
        get(
            {
                table: 'loancards',
                query: [`user_id_loancard=${path[2]}`, sel_status.value]
            },
            function (loancards, options) {
                set_count({id: 'loancards', count: loancards.length || '0'});
                loancards.forEach(loancard => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, table_date(loancard.createdAt));
                    add_cell(row, {text: loancard.lines.length || '0'});
                    add_cell(row, {text: loancard_statuses[loancard.status]})
                    add_cell(row, {
                        append: new Link({
                            href: `/stores/loancards/${loancard.loancard_id}`,
                            small: true
                        }).e
                    });
                });
            }
        );
    })
    .catch(err => console.log(err));
};
document.querySelector('#reload')              .addEventListener('click',  getLoancards);
document.querySelector('#sel_status_loancards').addEventListener('change', getLoancards);