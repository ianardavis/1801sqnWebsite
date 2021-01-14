function getIssueActions() {
    document.querySelectorAll('.actions-2, .actions-3').forEach(row => {
        get(
            function (issue, options) {
                if (issue._status === 2 || issue._status === 3) {
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
            },
            {
                table: 'issue',
                query: [`issue_id=${row.dataset.issue_id}`]
            }
        );
    });
};
function listNSNs(issue_id, size) {
    get(
        function (nsns, options) {
            let sel_nsn = document.querySelector(`#sel_nsn_${issue_id}`);
            if (sel_nsn) {
                sel_nsn.innerHTML = '';
                nsns.forEach(nsn => {
                    sel_nsn.appendChild(new Option({
                        text: print_nsn(nsn),
                        value: nsn.nsn_id,
                        selected: (nsn.nsn_id === size.nsn_id)
                    }).e)
                });
            };
        },
        {
            table: 'nsns',
            query: [`size_id=${size.size_id}`]
        }
    )
};
function listSerials(issue_id, size) {
    get(
        function (serials, options) {
            let sel_serial = document.querySelector(`#sel_serial_${issue_id}`);
            if (sel_serial) {
                sel_serial.innerHTML = '';
                serials.forEach(serial => {
                    if (serial.location) {
                        sel_serial.appendChild(
                            new Option({
                                text: `${serial._serial} | Location: ${serial.location._location}`,
                                value: serial.serial_id
                            }).e
                        );
                    };
                });
            };
        },
        {
            table: 'serials',
            query: [`size_id=${size.size_id}`]
        }
    )
};
function loadIssueActions() {
    let actions_interval = window.setInterval(
        function () {
            if (lines_loaded['2'] === true && lines_loaded['3'] === true) {
                getIssueActions();
                clearInterval(actions_interval);
            }
        },
        500
    );
};
document.querySelector('#reload').addEventListener('click', loadIssueActions);