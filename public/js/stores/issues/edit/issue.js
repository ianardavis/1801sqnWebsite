function addIssueOption(issue_id) {
    let select = document.querySelector(`#issue_${issue_id}`);
    if (select) select.appendChild(new Option({text: 'Issue', value: '4'}).e)
};
function issueOptions() {
    clear(`issue_${this.dataset.id}_details`)
    .then(div_details => {
        if (this.value === '4') {
            get({
                table: 'issue',
                query: [`"issue_id":"${this.dataset.id}"`],
                index: this.dataset.index
            })
            .then(function ([issue, options]) {
                if ([2,3].includes(issue.status)) {
                    if (issue.size.has_nsns) {
                        let nsn_select = new Select({
                            small: true,
                            attributes: [
                                {field: 'name',     value: `issues[][${options.index}][nsn_id]`},
                                {field: 'required', value: true}
                            ],
                            options: [{text: 'Select NSN'}]
                        }).e;
                        div_details.appendChild(nsn_select);
                        get({
                            table: 'nsns',
                            query: [`"size_id":"${issue.size_id}"`],
                            index: options.index
                        })
                        .then(function ([nsns, options]) {
                            nsns.forEach(e => nsn_select.appendChild(new Option({text: print_nsn(e), value: e.nsn_id}).e));
                        });
                    };
                    if (issue.size.has_serials) {
                        get({
                            table: 'current_serials',
                            query: [`"size_id":"${issue.size_id}"`],
                            index: options.index
                        })
                        .then(function ([serials, options]) {
                            let serial_options = [{text: 'Select Serial #'}];
                            serials.forEach(e => serial_options.push({text: e.serial, value: e.serial_id}));
                            for (let i = 0; i < issue.qty; i++) {
                                div_details.appendChild(new Select({
                                    small: true,
                                    attributes: [
                                        {field: 'name',     value: `issues[][${options.index}][serials][][${i}][serial_id]`},
                                        {field: 'required', value: true}
                                    ],
                                    options: serial_options
                                }).e);
                            };
                        });
                    } else {
                        add_stock_select(div_details, options.index, issue.size_id);
                        let stock_qty = new Input({
                            small: true,
                            attributes: [
                                {field: 'type',        value: 'number'},
                                {field: 'min',         value: '1'},
                                {field: 'Placeholder', value: 'Quantity'},
                                {field: 'name',        value: `issues[][${options.index}][qty]`},
                                {field: 'required',    value: true}
                            ]
                        }).e;
                        div_details.appendChild(stock_qty);
                        get({
                            table: 'stocks',
                            query: [`"size_id":"${issue.size_id}"`],
                            index: options.index
                        })
                        .then(function ([stocks, options]) {
                            stock_qty.setAttribute('max',   issue.qty);
                            stock_qty.setAttribute('value', issue.qty);
                        });
                    };
                } else if (issue.status === 4) {
                    add_stock_select(div_details, options.index, issue.size_id);
                };;
            });
        };
    });
};
function add_stock_select(div_details, index, size_id) {
    let stock_select = new Select({
        small: true,
        attributes: [
            {field: 'name',     value: `issues[][${index}][stock_id]`},
            {field: 'required', value: true}
        ],
        options: [{text: 'Select Location'}]
    }).e;
    div_details.appendChild(stock_select);
    get({
        table: 'stocks',
        query: [`"size_id":"${size_id}"`]
    })
    .then(function ([stocks, options]) {
        stocks.forEach(e => stock_select.appendChild(new Option({text: `${e.location.location} | Qty: ${e.qty}`, value: e.stock_id}).e));
    });
};