function addEditSelect() {
    let cells = document.querySelectorAll('.actions');
    cells.forEach(cell => {
        get({
            table: 'order',
            query: [`order_id=${cell.dataset.id}`]
        })
        .then(function ([order, options]) {
            if (order.status === 1) {
                cell.innerHTML = '';
                cell.appendChild(new Hidden({
                    attributes: [
                        {field: 'name',  value: `orders[][${cell.dataset.index}][order_id]`},
                        {field: 'value', value: order.order_id}
                    ]
                }).e);
                let select = new Select({
                    attributes: [
                        {field: 'id',         value: `order_${order.order_id}`},
                        {field: 'name',       value: `orders[][${cell.dataset.index}][status]`},
                        {field: 'data-id',    value: order.order_id},
                        {field: 'data-index', value: cell.dataset.index}
                    ],
                    small: true,
                    options: [
                        {text: 'Cancel', value: '0'},
                        {text: order_statuses[order.status], selected: true},
                        {text: 'Receive', value: '3'}
                    ]
                }).e
                select.addEventListener('change', addReceiptOptions);
                cell.appendChild(select);
                let div_details = document.createElement('div');
                div_details.setAttribute('id', `order_${order.order_id}_details`);
                cell.appendChild(div_details);
                return order.order_id
            };
        })
        .then(order_id => {if (typeof addDemandOption === 'function') addDemandOption(order_id)})
    });
};
function addReceiptOptions() {
    let div_details = document.querySelector(`#order_${this.dataset.id}_details`);
    if (div_details) {
        div_details.innerHTML = '';
        if (this.value === '3') {
            get({
                table: 'order',
                query: [`order_id=${this.dataset.id}`],
                index: this.dataset.index
            })
            .then(function ([order, options]) {
                if (order.status === 2) {
                    if (order.size.has_serials) {
                        get({
                            table: 'serials',
                            query: [`size_id=${order.size_id}`]
                        })
                        .then(function ([serials, options]) {
                            let locations = document.createElement('datalist'),
                            locs = [];
                            locations.setAttribute('id', `locations_${order.order_id}`);
                            serials.forEach(serial => {
                                if (locs.includes(serial.location.location)) {
                                    locations.appendChild(new Option({value: serial.location.location}).e);
                                    locs.push(serial.location.location);
                                };
                            });
                            div_details.appendChild(locations);
                        });
                        for (let i = 0; i < order.qty; i++) {
                            div_details.appendChild(new Input({
                                small: true,
                                attributes: [
                                    {field: 'Placeholder', value: `Serial # ${i + 1}`},
                                    {field: 'name',        value: `orders[][${options.index}][serials][][${i}][serial]`}
                                ]
                            }).e);
                            div_details.appendChild(new Input({
                                small: true,
                                attributes: [
                                    {field: 'Placeholder', value: `Location ${i + 1}`},
                                    {field: 'name',        value: `orders[][${options.index}][serials][][${i}][location]`},
                                    {field: 'list',        value: `locations_${order.order_id}`}
                                ]
                            }).e);
                        };
                    } else {
                        get({
                            table: 'stocks',
                            query: [`size_id=${order.size_id}`]
                        })
                        .then(function ([stocks, options]) {
                            let locations = document.createElement('datalist');
                            locations.setAttribute('id', `locations_${order.order_id}`);
                            stocks.forEach(stock => {
                                locations.appendChild(new Option({value: stock.location.location}).e)
                            });
                            div_details.appendChild(locations);
                        });
                        div_details.appendChild(new Input({
                            small: true,
                            attributes: [
                                {field: 'Placeholder', value: 'Location'},
                                {field: 'name',        value: `orders[][${options.index}][location]`},
                                {field: 'list',        value: `locations_${order.order_id}`}
                            ]
                        }).e);
                        div_details.appendChild(new Input({
                            small: true,
                            attributes: [
                                {field: 'value',       value: order.qty},
                                {field: 'Placeholder', value: 'Quantity'},
                                {field: 'name',        value: `orders[][${options.index}][qty]`}
                            ]
                        }).e);
                    };
                };
            });
        };
    };
};
window.addEventListener('load', function () {
    addFormListener(
        'order_edit',
        'PUT',
        '/orders',
        {onComplete: getOrders}
    );
});