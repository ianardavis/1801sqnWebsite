function viewUserEdit() {
    get({
        table: 'user',
        query: [`user_id=${path[2]}`]
    })
    .then(function (user, options) {
        listStatuses( {select: 'sel_statuses', selected: user.status_id, id_only: true});
        listRanks(    {select: 'sel_ranks',    selected: user.rank_id,   id_only: true});
        set_innerText({id: 'full_name_edit',     text: print_user(user)});
        set_value(    {id: 'inp_service_number', value: user.service_number});
        set_value(    {id: 'inp_rank_id',        value: user.rank.rank});
        set_value(    {id: 'inp_surname',        value: user.surname});
        set_value(    {id: 'inp_first_name',     value: user.first_name});
        set_value(    {id: 'inp_status_id',      value: user.status.status});
        set_value(    {id: 'inp_login_id',       value: user.login_id});
    });
};
window.addEventListener('load', function () {
    enable_button('user_edit');
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