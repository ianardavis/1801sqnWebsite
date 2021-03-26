window.addEventListener( "load", function () {
    addFormListener(
        'issue_add',
        'POST',
        '/stores/issues',
        {
            onComplete: getIssues
        }
    );
});