function issue_options() {
    if (this.dataset.id) {
        clear(`details_${this.dataset.id}`)
        .then(div_details => {
            div_details.appendChild(new Spinner(this.dataset.id).e);
            if (this.value === '-2') { // Remove from loancard
                get({
                    table: 'issue',
                    where: {issue_id: this.dataset.id},
                    index: this.dataset.index
                })
                .then(function ([issue, options]) {
                    if (issue.status === 4) add_stock_select(div_details, options.index, issue.size_id);
                    remove_spinner(issue.issue_id);
                });
            } else if (this.value === '4') { // Issue
                get({
                    table: 'issue',
                    where: {issue_id: this.dataset.id},
                    index: this.dataset.index
                })
                .then(function ([issue, options]) {
                    if ([2,3].includes(issue.status)) {
                        if (issue.size.has_nsns)    add_nsn_select(   div_details, options.index, issue.size_id);
                        if (issue.size.has_serials) add_serial_select(div_details, options.index, issue.size_id, issue.qty)
                        else {
                            add_stock_select(div_details, options.index, issue.size_id);
                            add_qty_input(   div_details, options.index, issue.qty);
                        };
                    } else if (issue.status === 4) {
                        add_stock_select(div_details, options.index, issue.size_id);
                    };
                    remove_spinner(issue.issue_id);
                });
            } else remove_spinner(this.dataset.id);
        })
        .catch(err => remove_spinner(this.dataset.id));
    };
};
function add_nsn_select(div_details, index, size_id) {
    let select = new Select({
        attributes: [
            {field: 'name',     value: `lines[][${index}][nsn_id]`},
            {field: 'required', value: true}
        ],
        options: [{text: 'Select NSN', selected: true}]
    }).e;
    div_details.appendChild(select);
    get({
        table: 'nsns',
        where: {size_id: size_id}
    })
    .then(function ([result, options]) {
        result.nsns.forEach(e => select.appendChild(new Option({
            text: print_nsn(e),
            value: e.nsn_id
        }).e));
    });
};
function add_stock_select(div_details, index, size_id) {
    let select = new Select({
        attributes: [
            {field: 'name',     value: `lines[][${index}][stock_id]`},
            {field: 'required', value: true}
        ],
        options: [{text: 'Select Location', selected: true}]
    }).e;
    div_details.appendChild(select);
    get({
        table: 'stocks',
        where: {size_id: size_id}
    })
    .then(function ([result, options]) {
        result.stocks.forEach(e => select.appendChild(new Option({
            text: `${e.location.location} | Qty: ${e.qty}`,
            value: e.stock_id
        }).e));
    });
};
function add_serial_select(div_details, index, size_id, qty) {
    get({
        table: 'current_serials',
        where: {size_id: size_id},
        index: index
    })
    .then(function ([result, options]) {
        let serial_options = [{text: 'Select Serial #'}];
        result.serials.forEach(e => serial_options.push({text: `Serial #: ${e.serial} | Location: ${serial.location.location}`, value: e.serial_id}));
        for (let i = 0; i < qty; i++) {
            div_details.appendChild(new Select({
                attributes: [
                    {field: 'name',     value: `lines[][${index}][serials][][${i}][serial_id]`},
                    {field: 'required', value: true}
                ],
                options: serial_options
            }).e);
        };
    });
};
function add_qty_input(div_details, index, qty) {
    div_details.appendChild(new Number_Input({
        attributes: [
            {field: 'min',         value: '1'},
            {field: 'max',         value: qty},
            {field: 'value',       value: qty},
            {field: 'Placeholder', value: 'Quantity'},
            {field: 'name',        value: `lines[][${index}][qty]`},
            {field: 'required',    value: true}
        ]
    }).e);
};