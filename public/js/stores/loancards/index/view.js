let loancard_statuses   = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"};
function getLoancards() {
    clear_table('loancards')
    .then(tbl_loancards => {
        let sel_status = document.querySelector('#sel_status') || {value: ''},
            sel_users  = document.querySelector('#sel_users')  || {value: ''};
        get({
            table: 'loancards',
            query: [sel_status.value, sel_users.value]
        })
        .then(function ([loancards, options]) {
            loancards.forEach(loancard => {
                let row = tbl_loancards.insertRow(-1);
                add_cell(row, table_date(loancard.createdAt));
                add_cell(row, {text: print_user(loancard.user_loancard)});
                add_cell(row, {text: loancard.lines.length || '0'});
                add_cell(row, {text: loancard_statuses[loancard.status]});
                add_cell(row, {append: new Link({href: `/loancards/${loancard.loancard_id}`, small: true}).e});
            });
        });
    });
};
function getUsers() {
    listUsers({
        select: 'users',
        blank: true,
        blank_text: 'All',
        append: '_loancard'
    })  
};
addReloadListener(getLoancards);
window.addEventListener('load', function () {
    getUsers();
    addListener('reload_users', getUsers);
    addListener('sel_status', getLoancards, 'change');
    addListener('sel_users',  getLoancards, 'change');
});