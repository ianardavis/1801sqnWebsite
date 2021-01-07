window.addEventListener( "load", function () {
    addFormListener(
        'form_delete',
        'DELETE',
        `/stores/issues/${path[3]}`,
        {onComplete: [getIssue, getLines]}
    );
});