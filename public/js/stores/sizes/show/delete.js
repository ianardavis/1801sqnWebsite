const enable_delete = enableButton('delete');
window.addEventListener( "load", function () {
    enableButton('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/sizes/${path[2]}`,
        {redirect: '/items'}
    );
});