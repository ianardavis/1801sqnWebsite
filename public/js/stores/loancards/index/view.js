const loancard_statuses = {
    0: "Cancelled", 
    1: "Draft", 
    2: "Complete", 
    3: "Closed"
};
function getLoancards() {
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
            func: getLoancards
        })
        .then(function ([results, options]) {
            results.loancards.forEach(loancard => {
                add_line(loancard);
            });
        })
    });
};
function getUsers() {
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

    addListener('reload', getLoancards);
    addListener('goto_loancard_id', );
    modalOnShow('loancard_open', function () {StartScanning(gotoLoancard)});
    modalOnHide('loancard_open', StopScanning);
    
    getUsers();
    addListener('btn_users_reload', getUsers);
    addListener('filter_loancard_status', getLoancards, 'input');
    addListener('filter_loancard_user',   getLoancards, 'change');
    addListener('filter_loancard_createdAt_from', function (){filter()}, 'change');
    addListener('filter_loancard_createdAt_to',   function (){filter()}, 'change');
    addSortListeners('loancards', getLoancards);
    getLoancards();
});