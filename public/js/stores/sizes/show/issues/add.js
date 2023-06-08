const enable_add_issue = enable_button('issue_add');
window.addEventListener('load', function () {
    enable_button('issue_add');
    modalOnShown('issue_add', selectedSizes, [path[2]]);
});