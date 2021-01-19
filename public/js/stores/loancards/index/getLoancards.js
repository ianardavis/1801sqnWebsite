function getLoancards() {
    let sel_status = document.querySelector('#sel_status') || {value: ''},
        sel_users  = document.querySelector('#sel_users')  || {value: ''},
        statuses   = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"},
        table_body = document.querySelector('#tbl_loancards');
    if (table_body) {
        table_body.innerHTML = '';
        get(
            function (loancards, options) {
                loancards.forEach(loancard => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, table_date(loancard.createdAt));
                    add_cell(row, {text: print_user(loancard.user_loancard)});
                    add_cell(row, {text: loancard.lines.length});
                    add_cell(row, {text: statuses[loancard._status]});
                    add_cell(row, {append: new Link({href: `/stores/loancards/${loancard.loancard_id}`, small: true}).e});
                });
            },
            {
                table: 'loancards',
                query: [sel_status.value, sel_users.value]
            }
        );
    };
};
function loadGetLoancards() {
    let get_interval = window.setInterval(
        function () {
            if (users_loaded === true) {
                getLoancards();
                clearInterval(get_interval);
            }
        },
        200
    );
};
document.querySelector('#reload')    .addEventListener('click',  loadGetLoancards);
document.querySelector('#sel_status').addEventListener('change', loadGetLoancards);
document.querySelector('#sel_users') .addEventListener('change', loadGetLoancards);