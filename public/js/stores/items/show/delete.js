const enable_delete_button = function () {enableButton('delete')};
window.addEventListener( "load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/items/${path[2]}`,
        {redirect: '/items'}
    );
});