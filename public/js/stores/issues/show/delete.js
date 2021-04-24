get({
    table: 'issue',
    query: [`issue_id=${path[2]}`]
})
.then(function([result, options]) {
    set_attribute({id: `btn_delete`, attribute: 'disabled', value: true});
    if ([1, 2, 3].includes(result.status)) enable_button('delete');
});
window.addEventListener( "load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/issues/${path[2]}`,
        {
            onComplete: [
                showIssue,
                function() {if (typeof showActions === 'function') {showActions()}}
            ]
        }
    );
});