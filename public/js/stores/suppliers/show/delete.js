window.addEventListener("load", function () {
    enableButton('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/suppliers/${path[2]}`,
        {redirect: '/suppliers'}
    );
});