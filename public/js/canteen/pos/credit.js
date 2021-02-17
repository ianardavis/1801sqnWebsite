function getUsers() {
    listUsers({
        select:    'sel_users',
        table:     'current',
        spinner:   'users_credit',
        blank:     true,
        blank_opt: {text: 'Select User'},
        id_only:   true
    });
};
window.addEventListener('load', function () {
    $('#mdl_sale_complete').on('show.bs.modal', getUsers);
    document.querySelector('#reload_credit').addEventListener('click', getUsers);
});