const loancard_statuses = {
    "0": "Cancelled", 
    "1": "Draft", 
    "2": "Complete", 
    "3": "Closed"
};
function get_loancards() {
    clear('tbl_loancards')
    .then(tbl_loancards => {
        function add_line(loancard) {
            let row = tbl_loancards.insertRow(-1);
            add_cell(row, table_date(loancard.createdAt));
            add_cell(row, {text: print_user(loancard.user_loancard)});
            add_cell(row, {text: loancard.lines.length || '0'});
            add_cell(row, {text: loancard_statuses[loancard.status]});
            add_cell(row, {append: new Link(`/loancards/${loancard.loancard_id}`).e});
        };
        get({
            table: 'loancards',
            ...build_filter_query(),
            func: get_loancards
        })
        .then(function ([results, options]) {
            results.loancards.forEach(loancard => {
                add_line(loancard);
            });
        })
    });
};
function get_users() {
    listUsers({
        select: 'filter_loancard_user',
        blank: {text: 'All'}
    })  
};
function gotoLoancard(loancard_id, result) {
    window.location.assign(`/loancards/${loancard_id}`);
};

function GoToEnter(input) {
    if(event.key === 'Enter') gotoLoancard(input.value);
};
window.addEventListener('load', function () {
    add_listener('reload', get_loancards);
    add_listener('goto_loancard_id', );
    modalOnShow('loancard_open', function () {StartScanning(gotoLoancard)});
    modalOnHide('loancard_open', StopScanning);
    
    get_users();
    add_listener('reload_users', get_users);
    add_listener('sel_loancard_statuses', get_loancards, 'input');
    add_listener('sel_users',    get_loancards, 'change');
    add_listener('createdAt_from', function (){filter()}, 'change');
    add_listener('createdAt_to',   function (){filter()}, 'change');
    add_sort_listeners('loancards', get_loancards);
    get_loancards();
});