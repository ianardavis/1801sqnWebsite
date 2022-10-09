function viewUserEdit() {
    get({
        table: 'user',
        where: {user_id: path[2]}
    })
    .then(function ([user, options]) {
        listStatuses( {select: 'sel_statuses', selected: user.status_id, id_only: true});
        listRanks(    {select: 'sel_ranks',    selected: user.rank_id,   id_only: true});
        set_innerText('full_name_edit', print_user(user));
        set_value('inp_service_number', user.service_number);
        set_value('inp_rank_id',        user.rank.rank);
        set_value('inp_surname',        user.surname);
        set_value('inp_first_name',     user.first_name);
        set_value('inp_status_id',      user.status.status);
        set_value('inp_login_id',       user.login_id);
    });
};
window.addEventListener('load', function () {
    enable_button('user_edit');
    enable_button('password_reset');
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
        `/users/users/${path[2]}`,
        {onComplete: getUser}
    );
    modalOnShow('user_edit', viewUserEdit);
});