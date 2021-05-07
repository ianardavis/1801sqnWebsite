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
    modalOnShow('sale_complete', getUsers);
    document.querySelector('#reload_credit').addEventListener('click', getUsers);
});