function addUserReset() {
    ['bader', 'rank_id', 'name', 'ini', 'status_id', 'login_id'].forEach(e => set_value({id: `inp_${e}`, value: ''}));
};
window.addEventListener( "load", function () {
    $('#mdl_user_add').on('show.bs.modal', addUserReset);
    addFormListener(
        'user_add',
        'POST',
        '/users/users',
        {
            onComplete: [
                getUsers,
                function () {$('#mdl_user_add').modal('hide')}
            ]
        }
    );
});