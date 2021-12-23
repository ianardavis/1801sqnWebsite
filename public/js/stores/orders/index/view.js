let order_statuses = {'0': 'Cancelled', '1': 'Placed', '2': 'Demanded', '3': 'Received'};
function query() {
    let where = null,
        like  = null,
        gt    = null,
        lt    = null;
    
    let sel_statuses = checked_statuses();
    if (sel_statuses) where = {status: sel_statuses};

    let date_from = document.querySelector(`#filter_orders_createdAt_from`) || {value: ''},
        date_to   = document.querySelector(`#filter_orders_createdAt_to`)   || {value: ''};
    if (date_from && date_from.value !== '') gt = {column: 'createdAt', value: date_from.value};
    if (date_to   && date_to.value   !== '') lt = {column: 'createdAt', value: date_to  .value};

    let item  = document.querySelector('#filter_orders_item')   || {value: ''},
        size1 = document.querySelector('#filter_orders_size_1') || {value: ''},
        size2 = document.querySelector('#filter_orders_size_2') || {value: ''},
        size3 = document.querySelector('#filter_orders_size_3') || {value: ''};
    if (item.value || size1.value || size2.value || size3.value) like = {};
    if (item .value !=='') like.description = item.value;
    if (size1.value !=='') like.size1       = size1.value;
    if (size2.value !=='') like.size2       = size2.value;
    if (size3.value !=='') like.size3       = size3.value;

    return {
        where: where,
        like:  like,
        gt:    gt,
        lt:    lt
    };
};
function getOrders() {
    clear('tbl_orders')
    .then(tbl_orders => {
        get({
            table: 'orders',
            ...query(),
            func: getOrders
        })
        .then(function ([result, options]) {
            let row_index = 0;
            result.orders.forEach(order => {
                let row = tbl_orders.insertRow(-1);
                add_cell(row, table_date(order.createdAt));
                add_cell(row, {text: order.size.item.description});
                add_cell(row, {text: print_size(order.size)});
                add_cell(row, {text: order.qty});
                add_cell(row, {
                    text: order_statuses[order.status] || 'Unknown',
                    append: new Input({
                        attributes: [
                            {field: 'type',  value: 'hidden'},
                            {field: 'name',  value: `orders[][${row_index}][order_id]`},
                            {field: 'value', value: order.order_id}
                        ]
                    }).e
                });
                let radios = [];
                if (
                    order.status === 0 ||
                    order.status === 1 ||
                    order.status === 2
                ) {
                    radios.push(nil_radio(order.order_id, row_index));
                };
                if (order.status === 0) {
                    radios.push(restore_radio(order.order_id, row_index));
                };
                if (order.status === 1) {
                    radios.push(demand_radio(order.order_id, row_index));
                };
                if (order.status === 1 || order.status === 2) {
                    radios.push(receive_radio(order.order_id, row_index));
                };
                radios.push(new Div({attributes: [{field: 'id', value: `${order.order_id}_details`}]}).e);
                add_cell(row, {
                    id: `${order.order_id}_row`,
                    append: radios
                });
                add_cell(row, {append: new Link({href: `/orders/${order.order_id}`}).e});
                row_index++;
            });
            if (typeof addEditSelect === 'function') addEditSelect();
            return tbl_orders;
        });
    });
};
function restore_radio(order_id, index) {
    return new Radio({
        id:          `${order_id}_restore`,
        float_start: true,
        classes:     ['radio_restore'],
        colour:      'success',
        html:        '<i class="fas fa-trash-restore-alt"></i>',
        attributes: [
            {field: 'name',          value: `orders[][${index}][status]`},
            {field: 'value',         value: '-1'},
            {field: 'data-order_id', value: order_id}
        ]
    }).e;
};
function nil_radio(order_id, index) {
    return new Radio({
        id:          `${order_id}_nil`,
        float_start: true,
        classes:     ['radio_nil'],
        colour:      'primary',
        html:        '<i class="fas fa-question"></i>',
        attributes: [
            {field: 'name',          value: `orders[][${index}][status]`},
            {field: 'data-order_id', value: order_id},
            {field: 'checked',       value: true}
        ],
        listener: {event: 'input', func: function () {clear(`${this.dataset.order_id}_details`)}}
    }).e;
};
function cancel_radio(order_id, index) {
    return new Radio({
        id:          `${order_id}_cancel`,
        float_start: true,
        classes:     ['radio_cancel'],
        colour:      'danger',
        html:        '<i class="fas fa-trash-alt"></i>',
        attributes: [
            {field: 'name',          value: `orders[][${index}][status]`},
            {field: 'value',         value: '0'},
            {field: 'data-order_id', value: order_id}
        ],
        listener: {event: 'input', func: function () {clear(`${this.dataset.order_id}_details`)}}
    }).e;
};
function demand_radio(order_id, index) {
    return new Radio({
        id:          `${order_id}_demand`,
        float_start: true,
        classes:     ['radio_demand'],
        colour:      'warning',
        html:        '<i class="fas fa-industry"></i>',
        attributes: [
            {field: 'name',          value: `orders[][${index}][status]`},
            {field: 'data-order_id', value: order_id},
            {field: 'value',         value: '2'}
        ],
        listener: {event: 'input', func: function () {console.log(this.dataset);clear(`${this.dataset.order_id}_details`)}}
    }).e;
};
function receive_radio(order_id, index) {
    return new Radio({
        id:          `${order_id}_receive`,
        float_start: true,
        classes:     ['radio_receive'],
        colour:      'success',
        html:        '<i class="fas fa-receipt"></i>',
        attributes: [
            {field: 'name',          value: `orders[][${index}][status]`},
            {field: 'value',         value: '3'},
            {field: 'data-order_id', value: order_id},
            {field: 'data-index',    value: index}
        ],
        listener: {event: 'input', func: receive_options}
    }).e;
};
function receive_options() {
    clear(`${this.dataset.order_id}_details`)
    .then(div_details => {
        div_details.appendChild(new Spinner({id: this.dataset.order_id}).e);
        if (this.value === '3') {
            get({
                table: 'order',
                where: {order_id: this.dataset.order_id},
                index: this.dataset.index
            })
            .then(function ([order, options]) {
                if ([1,2].includes(order.status)) {
                    if (order.size.has_serials) {
                        for (let i = 0; i < order.qty; i++) {
                            div_details.appendChild(new Select({
                                small: true,
                                attributes: [
                                    {field: 'name',     value: `orders[][${options.index}][serials][]`},
                                    {field: 'required', value: true}
                                ]
                            }).e);
                        };
                    } else {
                        add_stock_input(div_details, options.index, order.size_id);
                        let stock_qty = new Input({
                            small: true,
                            attributes: [
                                {field: 'type',        value: 'number'},
                                {field: 'min',         value: '1'},
                                {field: 'Placeholder', value: 'Receipt Quantity'},
                                {field: 'name',        value: `orders[][${options.index}][qty]`},
                                {field: 'required',    value: true},
                                {field: 'value',       value: order.qty}
                            ]
                        }).e;
                        div_details.appendChild(stock_qty);
                    };
                };
                remove_spinner(order.order_id);
            });
        };
    });
};
function add_stock_input(div_details, index, size_id) {
    let stock_input = new Input({
        small: true,
        attributes: [
            {field: 'name',     value: `orders[][${index}][stock_id]`},
            {field: 'required', value: true},
            {field: 'list',     value: `loc_list_${index}`},
            {field: 'placeholder', value: 'Enter Location...'}
        ],
        options: [{text: 'Select Location'}]
    }).e,
        list = document.createElement('datalist');
    list.setAttribute('id', `loc_list_${index}`);
    div_details.appendChild(stock_input);
    div_details.appendChild(list);
    get({
        table: 'stocks',
        where: {size_id: size_id}
    })
    .then(function ([result, options]) {
        result.stocks.forEach(e => list.appendChild(new Option({value: e.location.location}).e));
    });
};
addReloadListener(getOrders);
sort_listeners(
    'orders',
    getOrders,
    [
        {value: 'createdAt',   text: 'Date', selected: true},
        {value: 'description', text: 'Description'},
        {value: 'size1',       text: 'Size 1'},
        {value: 'size2',       text: 'Size 2'},
        {value: 'size3',       text: 'Size 3'},
        {value: 'qty',         text: 'Qty'},
        {value: 'status',      text: 'Status'}
    ]
);
window.addEventListener('load', function () {
    addListener('sel_status', getOrders, 'change');
    addListener('status_orders_0', getOrders, 'input');
    addListener('status_orders_1', getOrders, 'input');
    addListener('status_orders_2', getOrders, 'input');
    addListener('status_orders_3', getOrders, 'input');
    addListener('createdAt_from', function (){filter()}, 'change');
    addListener('createdAt_to',   function (){filter()}, 'change');
    addListener('item',           function (){filter()}, 'input');
    addListener('size',           function (){filter()}, 'input');
});
