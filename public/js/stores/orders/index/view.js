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
                    append: new Hidden({
                        attributes: [
                            {field: 'name',  value: `lines[][${row_index}][order_id]`},
                            {field: 'value', value: order.order_id}
                        ]
                    }).e
                });
                let radios = [], args = [order.order_id, row_index, receive_options];
                if (
                    order.status === 0 ||
                    order.status === 1 ||
                    order.status === 2
                ) {
                    if (typeof nil_radio     === 'function') radios.push(nil_radio(    ...args));
                };
                if (order.status === 0) {
                    if (typeof restore_radio === 'function') radios.push(restore_radio(...args));
                };
                if (order.status === 1) {
                    if (typeof demand_radio  === 'function') radios.push(demand_radio( ...args));
                };
                if (order.status === 1 || order.status === 2) {
                    if (typeof receive_radio === 'function') radios.push(receive_radio(...args));
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
function receive_options() {
    clear(`${this.dataset.id}_details`)
    .then(div_details => {
        div_details.appendChild(new Spinner(this.dataset.id).e);
        if (this.value === '3') {
            get({
                table: 'order',
                where: {order_id: this.dataset.id},
                index: this.dataset.index
            })
            .then(function ([order, options]) {
                if ([1,2].includes(order.status)) {
                    if (order.size.has_serials) {
                        for (let i = 0; i < order.qty; i++) {
                            div_details.appendChild(new Select({
                                attributes: [
                                    {field: 'name',     value: `lines[][${options.index}][serials][][${i}][serial]`},
                                    {field: 'required', value: true},
                                    {field: 'placeholder', value: `Serial ${i + 1}`}
                                ]
                            }).e);
                            div_details.appendChild(new Select({
                                attributes: [
                                    {field: 'name',     value: `lines[][${options.index}][serials][][${i}][location]`},
                                    {field: 'required', value: true},
                                    {field: 'placeholder', value: `Location ${i + 1}`}
                                ]
                            }).e);
                        };
                    } else {
                        let list = document.createElement('datalist');
                        list.setAttribute('id', `loc_list_${options.index}`);
                        div_details.appendChild(new Input({
                            attributes: [
                                {field: 'name',     value: `lines[][${options.index}][location]`},
                                {field: 'required', value: true},
                                {field: 'list',     value: `loc_list_${options.index}`},
                                {field: 'placeholder', value: 'Enter Location...'}
                            ]
                        }).e);
                        div_details.appendChild(list);
                        get({
                            table: 'stocks',
                            where: {size_id: order.size_id}
                        })
                        .then(function ([result, options]) {
                            result.stocks.forEach(e => list.appendChild(new Option({value: e.location.location}).e));
                        });
                        div_details.appendChild(new Input({
                            attributes: [
                                {field: 'type',        value: 'number'},
                                {field: 'min',         value: '1'},
                                {field: 'Placeholder', value: 'Receipt Quantity'},
                                {field: 'name',        value: `lines[][${options.index}][qty]`},
                                {field: 'required',    value: true},
                                {field: 'value',       value: order.qty}
                            ]
                        }).e);
                    };
                };
                remove_spinner(order.order_id);
            });
        };
    });
};
addReloadListener(getOrders);
sort_listeners(
    'orders',
    getOrders,
    [
        {value: '["createdAt"]',                 text: 'Date', selected: true},
        {value: '["size","item","description"]', text: 'Description'},
        {value: '["size","size1"]',              text: 'Size 1'},
        {value: '["size","size2"]',              text: 'Size 2'},
        {value: '["size","size3"]',              text: 'Size 3'},
        {value: '["qty"]',                       text: 'Qty'},
        {value: '["status"]',                    text: 'Status'}
    ]
);
window.addEventListener('load', function () {
    addListener('status_orders_0', getOrders, 'input');
    addListener('status_orders_1', getOrders, 'input');
    addListener('status_orders_2', getOrders, 'input');
    addListener('status_orders_3', getOrders, 'input');
    addListener('filter_orders_createdAt_from', getOrders, 'input');
    addListener('filter_orders_createdAt_to',   getOrders, 'input');
    addListener('filter_orders_item',   getOrders, 'input');
    addListener('filter_orders_size_1', getOrders, 'input');
    addListener('filter_orders_size_2', getOrders, 'input');
    addListener('filter_orders_size_3', getOrders, 'input');
    addFormListener(
        'order_edit',
        'PUT',
        '/orders',
        {onComplete: getOrders}
    );
});
