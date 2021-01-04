window.addEventListener( "load", function () {
    addFormListener(
        'form_complete',
        'PUT',
        `/stores/issues/${path[3]}`,
        {onComplete: [getIssue, getLines]}
    );
});