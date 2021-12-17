get({
    table: 'issue',
    where: {issue_id: path[2]}
})
.then(function([issue, options]) {
    disable_button('delete');
    if ([1, 2, 3].includes(issue.status)) enable_button('delete');
});
window.addEventListener( "load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/issues/${path[2]}`,
        {
            onComplete: [
                getIssue,
                function() {if (typeof showActions === 'function') {showActions()}}
            ]
        }
    );
});