const enable_delete_button = function () {enable_button('delete')};
window.addEventListener( "load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/items/${path[2]}`,
        {redirect: '/items'}
    );
});