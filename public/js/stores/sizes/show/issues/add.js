const enable_add_issue = enableButton('issue_add');
window.addEventListener('load', function () {
    enableButton('issue_add');
    modalOnShown('issue_add', selectedSizes, [path[2]]);
});