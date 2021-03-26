get(
    {
        table: 'issue',
        query: [`issue_id=${path[2]}`]
    },
    function(result, options) {
        set_attribute({id: `btn_delete`, attribute: 'disabled', value: true});
        if (result._status === 1 || result._status === 2 || result._status === 3) remove_attribute({id: `btn_delete`, attribute: 'disabled'});
    }
);
window.addEventListener( "load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/stores/issues/${path[2]}`,
        {
            onComplete: [
                showIssue,
                function() {if (typeof showActions === 'function') {showActions()}}
            ]
        }
    );
});