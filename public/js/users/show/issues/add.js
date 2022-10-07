window.addEventListener( "load", function () {
    enable_button('issues_action');
    enable_button('issue_add');
    modalOnShown('issue_add', selectedUsers, [path[2]]);
});