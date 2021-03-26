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
    $('#mdl_user_add').on('show.bs.modal', addUserReset);
    $('#mdl_user_add').on('show.bs.modal', getRanksAdd);
    $('#mdl_user_add').on('show.bs.modal', getStatusesAdd);
    addFormListener(
        'user_add',
        'POST',
        '/users',
        {
            onComplete: [
                getUsers,
                function () {$('#mdl_user_add').modal('hide')}
            ]
        }
    );
    document.querySelector('#reload_ranks_add')   .addEventListener("click", getRanksAdd);
    document.querySelector('#reload_statuses_add').addEventListener("click", getStatusesAdd);
});