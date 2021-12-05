function addEditSelect() {
    hide('sel_all');
    let cells = document.querySelectorAll('.actions'),
        actions = [];
    cells.forEach(cell => {
        actions.push(
            new Promise(resolve => {
                get({
                    table: 'issue',
                    query: [`"issue_id":"${cell.dataset.id}"`]
                })
                .then(function ([issue, options]) {
                    if ([1, 2, 3, 4].includes(issue.status)) {
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
                            classes: ['issue_action'],
                            small: true,
                            options: options
                        }).e
                        if (typeof issueOptions === 'function') select.addEventListener('change', issueOptions);
                        cell.appendChild(select);
                        let div_details = document.createElement('div');
                        div_details.setAttribute('id', `issue_${issue.issue_id}_details`);
                        cell.appendChild(div_details);
                        return issue;
                    } else return issue;
                })
                .then(issue => {
                    if (issue) {
                        if (issue.status === 1            && issue.size.issueable && typeof addApproveOption  === 'function') addApproveOption( issue.issue_id);
                        if (issue.status === 2            && issue.size.orderable && typeof addOrderOption    === 'function') addOrderOption(   issue.issue_id);
                        if ([2, 3].includes(issue.status) && issue.size.issueable && typeof addIssueOption    === 'function') addIssueOption(   issue.issue_id);
                        if (issue.status === 4                                    && typeof addLoancardOption === 'function') addLoancardOption(issue.issue_id);
                    };
                    resolve(true);
                })
                .catch(err => {
                    console.log(err);
                    resolve(false);
                });
            })
        );
    });
    Promise.all(actions)
    .then(result => show('sel_all'));
};
function select_all() {
    if (this.value !== 'Select All') {
        document.querySelectorAll('.issue_action').forEach(select => {
            if (select.innerHTML.indexOf(`value="${this.value}"`) !== -1) {
                if (!select.value) {
                    select.value = String(this.value);
                    if (typeof issue_options === 'function') issue_options.call(select);
                };
            };
        });
    };
};
window.addEventListener('load', function () {
    addListener('sel_all', select_all, 'change');
    addFormListener(
        'issue_edit',
        'PUT',
        '/issues',
        {onComplete: getIssues}
    );
});