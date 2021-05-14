function addEditSelect() {
    let cells = document.querySelectorAll('.actions');
    cells.forEach(cell => {
        get({
            table: 'issue',
            query: [`issue_id=${cell.dataset.id}`]
        })
        .then(function ([issue, options]) {
            if ([1,2,3].includes(issue.status)) {
                cell.innerHTML = '';
                cell.appendChild(new Hidden({
                    attributes: [
                        {field: 'name',  value: `issues[][${cell.dataset.index}][issue_id]`},
                        {field: 'value', value: issue.issue_id}
                    ]
                }).e);
                let options = [];
                if ([1,2,3].includes(issue.status)) options.push({text: 'Cancel', value: '0'});
                options.push({text: issue_statuses[issue.status], selected: true});
                let select = new Select({
                    attributes: [
                        {field: 'id',         value: `issue_${issue.issue_id}`},
                        {field: 'name',       value: `issues[][${cell.dataset.index}][status]`},
                        {field: 'data-id',    value: issue.issue_id},
                        {field: 'data-index', value: cell.dataset.index}
                    ],
                    small: true,
                    options: options
                }).e
                if (typeof issueOptions === 'function') select.addEventListener('change', issueOptions);
                cell.appendChild(select);
                let div_details = document.createElement('div');
                div_details.setAttribute('id', `issue_${issue.issue_id}_details`);
                cell.appendChild(div_details);
                return issue
            };
        })
        .then(issue => {
            if (issue.status === 1            && typeof addApproveOption === 'function') addApproveOption(issue.issue_id);
            if ([2, 3].includes(issue.status) && typeof addIssueOption   === 'function') addIssueOption(  issue.issue_id);
        })
    });
};
window.addEventListener('load', function () {
    addFormListener(
        'issue_edit',
        'PUT',
        '/issues',
        {onComplete: getIssues}
    );
});