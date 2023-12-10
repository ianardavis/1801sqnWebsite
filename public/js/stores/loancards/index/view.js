const loancard_statuses = {
    "0": "Cancelled", 
    "1": "Draft", 
    "2": "Complete", 
    "3": "Closed"
};
function get_loancards() {
    Promise.all([
        clear('tbl_loancards'),
        filterStatus('loancard')
    ])
    .then(([tbl_loancards, filterStatuses]) => {
        function add_line(loancard) {
            let row = tbl_loancards.insertRow(-1);
            addCell(row, tableDate(loancard.createdAt));
            addCell(row, {text: printUser(loancard.user_loancard)});
            addCell(row, {text: loancard.lines.length || '0'});
            addCell(row, {text: loancard_statuses[loancard.status]});
            addCell(row, {append: new Link(`/loancards/${loancard.loancard_id}`).e});
        };
        get({
            table: 'loancards',
            where: {
                ...filterStatuses,
                ...filterUser('loancard')
            },
            gt: filterDateFrom('loancard'),
            lt: filterDateTo('loancard'),
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
    listCurrentUsers({
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
    setStatusFilterOptions('loancard', [
        {value: '0', text: 'Cancelled'},
        {value: '1', text: 'Draft',    selected: true},
        {value: '2', text: 'Complete', selected: true},
        {value: '3', text: 'Closed'}
    ]);

    addListener('reload', get_loancards);
    addListener('goto_loancard_id', );
    modalOnShow('loancard_open', function () {StartScanning(gotoLoancard)});
    modalOnHide('loancard_open', StopScanning);
    
    get_users();
    addListener('reload_users', get_users);
    addListener('sel_loancard_statuses', get_loancards, 'input');
    addListener('filter_loancard_user', get_loancards, 'change');
    addListener('createdAt_from', function (){filter()}, 'change');
    addListener('createdAt_to',   function (){filter()}, 'change');
    addSortListeners('loancards', get_loancards);
    get_loancards();
});