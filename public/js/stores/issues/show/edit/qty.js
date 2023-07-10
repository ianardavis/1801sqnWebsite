function get_qty() {
    get({
        table: 'issue',
        where: {issue_id: path[2]}
    })
    .then(check_issue_status)
    .then(issue => set_value('inp_qty_edit', issue.qty))
    .catch(err => {
        modalHide('qty_edit');
        alert_toast(err.message);
        console.error(err);
    });
};
window.addEventListener('load', function () {
    modalOnShow('qty_edit', get_qty);
    enable_button('qty_edit');
    addFormListener(
        'qty_edit',
        'PUT',
        `/issues/${path[2]}/qty`,
        {onComplete: [
            getIssue,
            getActions
        ]}
    );
});