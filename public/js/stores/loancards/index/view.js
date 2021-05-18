let loancard_statuses   = {"0": "Cancelled", "1": "Draft", "2": "Complete", "3":"Closed"};
function getLoancards() {
    clear_table('loancards')
    .then(tbl_loancards => {
        let sel_users  = document.querySelector('#sel_users')  || {value: ''},
            statuses   = document.querySelectorAll("input[type='checkbox']:checked") || [],
            query      = [];
            statuses.forEach(e => query.push(e.value));
        get({
            table: 'loancards',
            query: [query.join('&'), sel_users.value]
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
            return tbl_loancards;
        })
        .then(tbl_loancards => filter(tbl_loancards));
    });
};
function filter(tbl_loancards) {
    if (!tbl_loancards) tbl_loancards = document.querySelector('#tbl_loancards');
    let from = new Date(document.querySelector('#createdAt_from').value).getTime() || '',
        to   = new Date(document.querySelector('#createdAt_to').value)  .getTime() || '';
        tbl_loancards.childNodes.forEach(row => {
        if (
            (!from || row.childNodes[0].dataset.sort > from) &&
            (!to   || row.childNodes[0].dataset.sort < to)
        )    row.classList.remove('hidden')
        else row.classList.add(   'hidden');
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
    addListener('status_0',     getLoancards, 'change');
    addListener('status_1',     getLoancards, 'change');
    addListener('status_2',     getLoancards, 'change');
    addListener('status_3',     getLoancards, 'change');
    addListener('sel_users',    getLoancards, 'change');
    addListener('createdAt_from', function (){filter()}, 'change');
    addListener('createdAt_to',   function (){filter()}, 'change');
    getLoancards();
});