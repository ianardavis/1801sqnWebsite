const disable_delete_button = function () {enableButton('delete')};
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