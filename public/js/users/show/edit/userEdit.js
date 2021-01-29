function getUserEdit(user_id) {
    get(
        function (user, options) {
            listStatuses({id: 'status_id_edit',  selected: user.status_id});
            listRanks(   {id: 'rank_id_edit',    selected: user.rank_id});
            set_attribute({id: 'inp_bader',      attribute: 'value', value: user._bader});
            set_attribute({id: 'inp_rank_id',    attribute: 'value', value: user.rank._rank});
            set_attribute({id: 'inp_name',       attribute: 'value', value: user._name});
            set_attribute({id: 'inp_ini',        attribute: 'value', value: user._ini});
            set_attribute({id: 'inp_status_id',  attribute: 'value', value: user.status._status});
            set_attribute({id: 'inp_login_id',   attribute: 'value', value: user._login_id});
            set_innerText({id: 'full_name_edit', text: print_user(user)});
        },
        {
            db: 'users',
            table: 'user',
            query: [`user_id=${user_id}`]
        }
    );
};
set_attribute({id: 'btn_user_edit', attribute: 'data-user_id', value: path[3]});
window.addEventListener('load', function () {
    addFormListener(
        'form_user_edit',
        'PUT',
        `/users/users/${path[3]}`,
        {
            onComplete: [
                getUser,
                function () {$('#mdl_user_edit').modal('hide')}
            ]
        }
    )
    $('#mdl_user_edit').on('show.bs.modal', function (event) {getUserEdit(event.relatedTarget.dataset.user_id)});
});