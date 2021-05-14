function addIssueOption(issue_id) {
    let select = document.querySelector(`#issue_${issue_id}`);
    if (select) select.appendChild(new Option({text: 'Issue', value: '4'}).e)
};
function issueOptions() {
    let div_details = document.querySelector(`#issue_${this.dataset.id}_details`);
    if (div_details) {
        div_details.innerHTML = '';
        if (this.value === '4') {
            get({
                table: 'issue',
                query: [`issue_id=${this.dataset.id}`],
                index: this.dataset.index
            })
            .then(function ([issue, options]) {
                if ([2,3].includes(issue.status)) {
                    if (issue.size.has_serials) {
                        get({
                            table: 'current_serials',
                            query: [`size_id=${issue.size_id}`]
                        })
                        .then(function ([serials, options]) {
                            let serial_options = [{text: 'Select Serial #'}];
                            serials.forEach(e => serial_options.push({text: e.serial, value: e.serial_id}));
                            for (let i = 0; i < issue.qty; i++) {
                                div_details.appendChild(new Select({
                                    small: true,
                                    attributes: [
                                        {field: 'name', value: `issues[][${options.index}][serials][][${i}][serial_id]`}
                                    ],
                                    options: serial_options
                                }).e);
                            };
                        });
                    } else {
                        get({
                            table: 'stocks',
                            query: [`size_id=${issue.size_id}`]
                        })
                        .then(function ([stocks, options]) {
                            let stock_options = [{text: 'Select Location'}];
                            stocks.forEach(e => stock_options.push({text: e.location.location, value: e.stock_id}));
                            div_details.appendChild(new Select({
                                small: true,
                                attributes: [
                                    {field: 'name', value: `issues[][${options.index}][stock_id]`}
                                ],
                                options: stock_options
                            }).e);
                            div_details.appendChild(new Input({
                                small: true,
                                attributes: [
                                    {field: 'type',        value: 'number'},
                                    {field: 'max',         value: issue.qty},
                                    {field: 'min',         value: '1'},
                                    {field: 'value',       value: issue.qty},
                                    {field: 'Placeholder', value: 'Quantity'},
                                    {field: 'name',        value: `issues[][${options.index}][qty]`}
                                ]
                            }).e);
                        });
                    };
                };
            });
        };
    };
};