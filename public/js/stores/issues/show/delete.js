const disable_delete_button = function () {enable_button('delete')};
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