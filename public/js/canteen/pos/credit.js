function getUsers() {
    listUsers({
        select:     'users',
        table:      'users_current',
        spinner:    'users_credit',
        blank:      true,
        blank_text: 'Select User',
        id_only:    true
    });
};
window.addEventListener('load', function () {
    modalOnShow('sale_complete', getUsers);
    addListener('reload_credit', getUsers)
});