function viewUserEdit() {
    get(
        {
            table: 'user',
            query: [`user_id=${path[3]}`]
        },
        function (user, options) {
            listStatuses({id: 'status_id_edit',  selected: user.status_id});
            listRanks(   {id: 'rank_id_edit',    selected: user.rank_id});
            set_innerText({id: 'full_name_edit', text: print_user(user)});
            set_value({id: 'inp_bader',     value: user._bader});
            set_value({id: 'inp_rank_id',   value: user.rank._rank});
            set_value({id: 'inp_name',      value: user._name});
            set_value({id: 'inp_ini',       value: user._ini});
            set_value({id: 'inp_status_id', value: user.status._status});
            set_value({id: 'inp_login_id',  value: user._login_id});
        }
    );
};
window.addEventListener('load', function () {
    remove_attribute({id: 'btn_user_edit', attribute: 'disabled'});
    addFormListener(
        'user_edit',
        'PUT',
        `/users/users/${path[3]}`,
        {
            onComplete: [
                getUser,
                function () {$('#mdl_user_edit').modal('hide')}
            ]
        }
    );
    addFormListener(
        'password_reset',
        'PUT',
        `/users/users/${path[3]}`,
        {onComplete: getUser}
    );
    $('#mdl_user_edit').on('show.bs.modal', viewUserEdit);
});