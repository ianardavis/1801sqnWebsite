function approve_radio(issue_id, index) {
    return new Radio({
        id: `${issue_id}_decline`,
        float_start: true,
        classes: ['radio_decline'],
        colour: 'danger',
        html: '<i class="fas fa-times-circle"></i>',
        attributes: [
            {field: 'name',     value: `issues[][${index}][status]`},
            {field: 'value',    value: '0'},
            {field: 'disabled', value: true}
        ]
    }).e;
};
function decline_radio(issue_id, index) {
    return new Radio({
        id: `${issue_id}_approve`,
        float_start: true,
        classes: ['radio_approve'],
        colour: 'success',
        html: '<i class="fas fa-times-circle"></i>',
        attributes: [
            {field: 'name',     value: `issues[][${index}][status]`},
            {field: 'value',    value: '2'},
            {field: 'disabled', value: true}
        ]
    }).e
};
function nil_radio(issue_id, index) {
    return new Radio({
        id: `${issue_id}_nil`,
        float_start: true,
        classes: ['radio_nil'],
        colour: 'primary',
        html: '<i class="fas fa-question"></i>',
        attributes: [
            {field: 'name',          value: `issues[][${index}][status]`},
            {field: 'value',         value: '0'},
            {field: 'data-issue_id', value: issue_id},
            {field: 'disabled',      value: true},
            {field: 'checked',       value: true}
        ],
        listener: {event: 'input', func: function () {clear(`${this.dataset.issue_id}_details`)}}
    }).e;
};
function cancel_radio(issue_id, index) {
    return new Radio({
        id: `${issue_id}_cancel`,
        float_start: true,
        classes: ['radio_cancel'],
        colour: 'danger',
        html: '<i class="fas fa-trash-alt"></i>',
        attributes: [
            {field: 'name',          value: `issues[][${index}][status]`},
            {field: 'value',         value: '-1'},
            {field: 'data-issue_id', value: issue_id},
            {field: 'disabled',      value: true}
        ],
        listener: {event: 'input', func: function () {clear(`${this.dataset.issue_id}_details`)}}
    }).e;
};
function issue_radio(issue_id, index) {
    return new Radio({
        id: `${issue_id}_issue`,
        float_start: true,
        classes: ['radio_issue'],
        colour: 'success',
        html: '<i class="fas fa-address-card"></i>',
        attributes: [
            {field: 'name',          value: `issues[][${index}][status]`},
            {field: 'value',         value: '4'},
            {field: 'data-issue_id', value: issue_id},
            {field: 'data-index',    value: index},
            {field: 'disabled',      value: true}
        ],
        ...(typeof issue_options === 'function' ? {listener: {event: 'input', func: issue_options}}: {})
    }).e;
};

function issue_options() {
    clear(`${this.dataset.issue_id}_details`)
    .then(div_details => {
        if (this.value === '4') {
            get({
                table: 'issue',
                query: [`"issue_id":"${this.dataset.issue_id}"`],
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
function loancard_options() {
    clear(`issue_${this.dataset.id}_details`)
    .then(div_details => {
        if (this.value === '-2') {
            get({
                table: 'issue',
                query: [`"issue_id":"${this.dataset.id}"`],
                index: this.dataset.index
            })
            .then(function ([issue, options]) {
                if (issue.status === 4) {
                    let stock_select = new Select({
                        small: true,
                        attributes: [
                            {field: 'name',     value: `issues[][${options.index}][stock_id]`},
                            {field: 'required', value: true}
                        ],
                        options: [{text: 'Return Location'}]
                    }).e;
                    div_details.appendChild(stock_select);
                    get({
                        table: 'stocks',
                        query: [`"size_id":"${issue.size_id}"`],
                        index: options.index
                    })
                    .then(function ([stocks, options]) {
                        stocks.forEach(e => stock_select.appendChild(new Option({text: `${e.location.location} | Qty: ${e.qty}`, value: e.stock_id}).e));
                    });
                };
            });
        };
    });
};
function enable_radios(table) {
    let radios = table.querySelectorAll('input[type="radio"]');
    radios.forEach(e => e.removeAttribute('disabled'));
};
window.addEventListener('load', function () {
    enable_button('action_lines');
    addFormListener(
        'issue_edit',
        'PUT',
        '/issues',
        {onComplete: getIssues}
    );
});