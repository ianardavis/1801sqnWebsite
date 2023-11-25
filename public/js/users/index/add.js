function addUserReset() {
    ['service_number', 'surname', 'first_name', 'login_id'].forEach(e => set_value(`inp_${e}`));
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
    enableButton('user_add');
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
    add_listener('reload_ranks_add',    getRanksAdd);
    add_listener('reload_statuses_add', getStatusesAdd);
});