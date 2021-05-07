function addUserReset() {
    ['service_number', 'surname', 'first_name', 'login_id'].forEach(e => set_value({id: `inp_${e}`, value: ''}));
};
function getStatusesAdd() {
    listStatuses({
        spinner: 'statuses_add',
        select:  'sel_statuses_add',
        id_only: true
    });
};
function getRanksAdd() {
    listRanks({
        spinner: 'ranks_add',
        select:  'sel_ranks_add',
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
    document.querySelector('#reload_ranks_add')   .addEventListener("click", getRanksAdd);
    document.querySelector('#reload_statuses_add').addEventListener("click", getStatusesAdd);
});