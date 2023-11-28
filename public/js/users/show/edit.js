function viewUserEdit() {
    get({
        table: 'user',
        where: {user_id: path[2]}
    })
    .then(function ([user, options]) {
        listStatuses( {select: 'sel_statuses', selected: user.status_id, id_only: true});
        listRanks(    {select: 'sel_ranks',    selected: user.rank_id,   id_only: true});
        setInnerText('full_name_edit', printUser(user));
        setValue('inp_service_number', user.service_number);
        setValue('inp_rank_id',        user.rank.rank);
        setValue('inp_surname',        user.surname);
        setValue('inp_first_name',     user.first_name);
        setValue('inp_status_id',      user.status.status);
        setValue('inp_login_id',       user.login_id);
    });
};
window.addEventListener('load', function () {
    enableButton('user_edit');
    enableButton('password_reset');
    addFormListener(
        'user_edit',
        'PUT',
        `/users/${path[2]}`,
        {
            onComplete: [
                getUser,
                function () {modalHide('user_edit')}
            ]
        }
    );
    addFormListener(
        'password_reset',
        'PUT',
        `/password/${path[2]}/toggle`,
        {onComplete: getUser}
    );
    modalOnShow('user_edit', viewUserEdit);
});
