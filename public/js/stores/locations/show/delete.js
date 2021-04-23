window.addEventListener( "load", function () {
    enable_button('delete');
    addFormListener(
        'location_delete',
        'DELETE',
        `/locations/${path[2]}`,
        {redirect: '/'}
    );
});