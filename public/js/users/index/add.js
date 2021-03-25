function addUserReset() {
    ['service_number', 'rank_id', 'surname', 'first_name', 'status_id', 'login_id'].forEach(e => set_value({id: `inp_${e}`, value: ''}));
};
function getStatusesAdd() {
    listStatuses({
        select: 'sel_statuses_add',
        id_only: true
    });
};
function getRanksAdd() {
    listRanks({
        select: 'sel_ranks_add',
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
    document.querySelector('#reload').addEventListener('click', getRanksAdd);
    document.querySelector('#reload').addEventListener('click', getStatusesAdd);
});