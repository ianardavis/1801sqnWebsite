let loancard_statuses   = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"};
function getLoancards() {
    clear_table('loancards')
    .then(tbl_loancards => {
        let sel_status = document.querySelector('#sel_status') || {value: ''},
            sel_users  = document.querySelector('#sel_users')  || {value: ''};
        get(
            {
                table: 'loancards',
                query: [sel_status.value, sel_users.value]
            },
            
        )
        .then(function ([loancards, options]) {
            loancards.forEach(loancard => {
                let row = tbl_loancards.insertRow(-1);
                add_cell(row, table_date(loancard.createdAt));
                add_cell(row, {text: print_user(loancard.user_loancard)});
                add_cell(row, {text: loancard.lines.length});
                add_cell(row, {text: loancard_statuses[loancard.status]});
                add_cell(row, {append: new Link({href: `/loancards/${loancard.loancard_id}`, small: true}).e});
            });
        });
    });
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
function getUsers() {
    listUsers({
        select: 'users',
        blank: true,
        blank_opt: {text: 'All'},
        append: '_loancard'
    })  
};
addReloadListener(loadGetLoancards);
window.addEventListener('load', function () {
    addListener('reload_users', function () {});
    addListener('sel_status', loadGetLoancards)
    document.querySelector('#sel_status').addEventListener('change', loadGetLoancards);
    document.querySelector('#sel_users') .addEventListener('change', loadGetLoancards);
    getUsers();
});