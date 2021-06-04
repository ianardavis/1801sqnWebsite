function addApproveOption(issue_id) {
    let select = document.querySelector(`#issue_${issue_id}`);
    if (select) {
        select.appendChild(new Option({text: 'Decline', value: '-1'}).e);
        select.appendChild(new Option({text: 'Approve', value: '2'}).e);
    };
};