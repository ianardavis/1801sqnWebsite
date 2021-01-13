function getReturnAction() {
    document.querySelectorAll('.actions-4').forEach(row => {
        get(
            function (issue, options) {
                if (issue._status === 4) {
                    let select = document.querySelector(`#sel_action_${issue.issue_id}`);
                    if (select) {
                        select.appendChild(new Option({text: 'Return', value: '5'}).e);
                        select.addEventListener('change', function () {
                            if (this.value === '5') {
                                let return_div = new Div({attributes: [{field: 'id', value: `div_return_${issue.issue_id}`}]}).e;
                                return_div.appendChild(
                                    new Select({
                                        attributes: [
                                            {field: 'id',   value: `sel_stock_${issue.issue_id}`},
                                            {field: 'name', value: `lines[${issue.issue_id}][stock_id]`},
                                        ]
                                    }).e);
                                return_div.appendChild(new Input({attributes: [
                                    {field: 'name',        value: `lines[${issue.issue_id}][_location]`},
                                    {field: 'placeholder', value: 'Enter location'}
                                ]}).e);
                                listStocks(issue.issue_id, issue.size, true);
                                row.appendChild(return_div);
                            } else {
                                let div_return = document.querySelector(`#div_return_${issue.issue_id}`);
                                if (div_return) div_return.remove();
                            };

                        });
                    };
                }
                row.removeAttribute('class');
                row.removeAttribute('data-issue_id')
            },
            {
                table: 'issue',
                query: [`issue_id=${row.dataset.issue_id}`]
            }
        );
    });
};