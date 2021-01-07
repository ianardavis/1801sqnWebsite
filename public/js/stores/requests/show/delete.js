window.addEventListener( "load", function () {
    addFormListener(
        'form_delete',
        'DELETE',
        `/stores/requests/${path[3]}`,
        {
            onComplete: [
                getRequest,
                getLines
            ]
        }
    );
});