function addUserReset() {
    ['service_number', 'surname', 'first_name', 'login_id'].forEach(e => set_value({id: `inp_${e}`, value: ''}));
};
function getStatusesAdd() {
    listStatuses({
        select:  'sel_statuses_add',
        spinner: 'statuses_add',
        id_only: true
    });
};
function getRanksAdd() {
    listRanks({
        select:  'sel_ranks_add',
        spinner: 'ranks_add',
        id_only: true
    });
};
window.addEventListener( "load", function () {
    modalOnShow('user_add', addUserReset);
    modalOnShow('user_add', getRanksAdd);
    modalOnShow('user_add', getStatusesAdd);
    addFormListener(
        'user_add',
        'POST',
        '/users',
        {
            onComplete: [
                getUsers,
                function () {modalHide('user_add')}
            ]
        }
    );
    addListener('reload_ranks_add',    getRanksAdd);
    addListener('reload_statuses_add', getStatusesAdd);
});