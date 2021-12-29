function getUsers() {
    listUsers({
        table:   'users_current',
        spinner: 'users_credit',
        blank:   {text: 'Select User'}
    });
};
window.addEventListener('load', function () {
    modalOnShow('sale_complete', getUsers);
    addListener('reload_credit', getUsers)
});