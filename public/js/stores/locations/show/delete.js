window.addEventListener( "load", function () {
    enableButton('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/locations/${path[2]}`,
        {redirect: '/'}
    );
});