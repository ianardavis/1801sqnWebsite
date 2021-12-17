function getLineActions() {
    document.querySelectorAll('.actions').forEach(e => {
        get({
            table: 'demand_line',
            where: {demand_line_id: e.dataset.id},
        })
        .then(function ([line, options]) {
            if ([1, 2].includes(line.status)) {
                let opts = [],
                    div_action  = document.createElement('div'),
                    div_actions = document.createElement('div'),
                    div_details = document.createElement('div');
                div_actions.appendChild(new Hidden({
                    attributes: [
                        {field: 'name',  value: `actions[${e.dataset.index}][demand_line_id]`},
                        {field: 'value', value: line.demand_line_id}
                    ]
                }).e);
                opts.push({text: line_statuses[line.status], selected: true});
                opts.push({text: 'Cancel', value: '0'});
                if (line.status === 2) opts.push({text: 'Receive', value: '3'});
                let status = new Select({
                    attributes: [
                        {field: 'name', value: `actions[${e.dataset.index}][status]`},
                        {field: 'id',   value: `sel_${line.demand_line_id}`}
                    ],
                    small:      true,
                    options:    opts
                }).e;
                status.addEventListener("change", function () {
                    clearElement(`action_${line.demand_line_id}`);
                    clearElement(`details_${line.demand_line_id}`);
                    if (this.value === '3') {
                        let div_details = document.querySelector(`#details_${line.demand_line_id}`);
                        if (div_details) {
                            div_details.innerHTML = '';
                            add_spinner(div_details, {id: line.demand_line_id});
                            get({
                                table: 'size',
                                where: {size_id: line.size_id}
                            })
                            .then(function ([size, options]) {
                                if (size.has_serials) addSerialEntry(div_details, e.dataset.index, line.qty)
                                else                  addStockEntry (div_details, e.dataset.index, line.qty, size.size_id);
                                remove_spinner(line.demand_line_id);
                            })
                            .catch(err => remove_spinner(line.demand_line_id));
                        };
                    };
                });
                div_action.setAttribute( 'id', `action_${line.demand_line_id}`);
                div_details.setAttribute('id', `details_${line.demand_line_id}`);
                div_actions.appendChild(status);
                div_actions.appendChild(div_action);
                div_actions.appendChild(div_details);
                e.innerText = '';
                e.appendChild(div_actions);
            };
        });
    });
};
function addSerialEntry(div_details, index, qty) {
    for (let i = 0; i < qty; i++) {
        div_details.appendChild(
            new Input({
                attributes: [
                    {field: 'name',        value: `actions[${index}][serials][${i}][location]`},
                    {field: 'placeholder', value: `Enter Location (${i + 1})`}
                ],
                small: true
            }).e
        );
        div_details.appendChild(
            new Input({
                attributes: [
                    {field: 'name',        value: `actions[${index}][serials][${i}][serial]`},
                    {field: 'placeholder', value: `Enter Serial # (${i + 1})`}
                ],
                small: true
            }).e
        );
        div_details.appendChild(document.createElement('hr'));
    };
};
function addStockEntry(div_details, index, qty, size_id) {
    add_spinner(div_details, {id: `stocks_${index}`});
    get({
        table: 'stocks',
        where: {size_id: size_id}
    })
    .then(function ([stocks, options]) {
        let location_list = document.createElement('datalist');
        location_list.setAttribute('id', `locations_${index}`);
        stocks.forEach(e => location_list.appendChild(new Option({value: e.location.location}).e));
        div_details.appendChild(location_list);
        div_details.appendChild(
            new Input({
                attributes: [
                    {field: 'name',         value: `actions[${index}][receipt][location]`},
                    {field: 'required',     value: true},
                    {field: 'list',         value: `locations_${index}`},
                    {field: 'autocomplete', value: 'off'},
                    {field: 'placeholder',  value: 'Location'}
                ],
                small: true
            }).e
        );
        div_details.appendChild(
            new Input({
                attributes: [
                    {field: 'name',         value: `actions[${index}][receipt][qty]`},
                    {field: 'value',        value: qty},
                    {field: 'required',     value: true},
                    {field: 'autocomplete', value: 'off'},
                    {field: 'placeholder',  value: 'Quantity'}
                ],
                small: true
            }).e
        );
        remove_spinner(`stocks_${index}`);
    });
};
function setActionButton() {
    get({
        table: 'demand',
        where: {demand_id: path[2]}
    })
    .then(function([demand, options]) {
        if ([1,2].includes(demand.status)) enable_button('action')
        else                               disable_button('action');
    });
};
window.addEventListener( "load", function () {
    setActionButton();
    addFormListener(
        'action',
        'PUT',
        '/demand_lines',
        {
            onComplete: [
                getLines,
                setActionButton
            ]
        }
    );
});