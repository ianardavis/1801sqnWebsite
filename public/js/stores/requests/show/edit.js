window.addEventListener( "load", function () {
    addFormListener(
        'form_complete',
        'PUT',
        `/stores/requests/${path[3]}`,
        {
            onComplete: [
                getRequest,
                getLines
            ]
        }
    );
});