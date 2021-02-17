function getIssueActions(status) {
    document.querySelectorAll(`.actions-${status}`).forEach(row => {
        get(
            {
                table: 'issue',
                query: [`issue_id=${row.dataset.id}`]
            },
            function (issue, options) {
                if (
                    (issue._status === 2 || issue._status === 3) &&
                    issue._issueable
                ) {
                    let select = document.querySelector(`#sel_action_${issue.issue_id}`);
                    if (select) {
                        select.appendChild(new Option({text: 'Issue', value: '4'}).e);
                        select.addEventListener('change', function () {
                            if (this.value === '4') {
                                let issue_div = new Div({attributes: [{field: 'id', value: `div_issue_${issue.issue_id}`}]}).e;
                                if (issue.size._nsns) {
                                    issue_div.appendChild(new Select({attributes: [
                                        {field: 'id',       value: `sel_nsn_${issue.issue_id}`},
                                        {field: 'name',     value: `lines[${issue.issue_id}][nsn_id]`},
                                        {field: 'required', value: true}
                                    ]}).e);
                                    listNSNs(issue.issue_id, issue.size);
                                };
                                if (issue.size._serials) {
                                    issue_div.appendChild(new Select({attributes: [
                                        {field: 'id',       value: `sel_serial_${issue.issue_id}`},
                                        {field: 'name',     value: `lines[${issue.issue_id}][serial_id]`},
                                        {field: 'required', value: true}
                                    ]}).e);
                                    listSerials(issue.issue_id, issue.size);
                                } else {
                                    issue_div.appendChild(new Select({attributes: [
                                        {field: 'id',       value: `sel_stock_${issue.issue_id}`},
                                        {field: 'name',     value: `lines[${issue.issue_id}][stock_id]`},
                                        {field: 'required', value: true}
                                    ]}).e)
                                    listStocks(issue.issue_id, issue.size);
                                };
                                row.appendChild(issue_div);
                            } else {
                                let div_issue = document.querySelector(`#div_issue_${issue.issue_id}`);
                                if (div_issue) div_issue.remove();
                            };

                        });
                    };
                };
            }
        );
    });
};