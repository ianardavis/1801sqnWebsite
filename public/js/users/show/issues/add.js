window.addEventListener( "load", function () {
    enableButton('issues_action');
    enableButton('issue_add');
    modalOnShown('issue_add', selectedUsers, [path[2]]);
});