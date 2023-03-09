function getUsers() {
    listUsers({
        location: 'users/current',
        spinner:  'users_credit',
        blank:    {text: 'Select User'}
    });
};
function getPaymentUsers() {
    listUsers({
        select:   'sel_users_payment',
        location: 'users/current',
        spinner:  'users_payment',
        blank:   {text: 'Select User'}
    });
};
window.addEventListener('load', function () {
    modalOnShow('sale_complete',  getUsers);
    modalOnShow('sale_complete',  getPaymentUsers);
    add_listener('reload_credit',  getUsers);
    add_listener('reload_payment', getPaymentUsers);
});