window.addEventListener( "load", function () {
    addFormListener(
        'form_action',
        'PUT',
        `/stores/issue_lines/${path[3]}`,
        {onComplete: getLines}
    );
});