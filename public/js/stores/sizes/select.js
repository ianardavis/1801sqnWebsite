function reset_add_size() {
    let div_sizes    = document.querySelector('#div_sizes'),
        div_size     = document.querySelector('#div_size'),
        sel_items    = document.querySelector('#sel_items'),
        sel_sizes    = document.querySelector('#sel_sizes'),
        inp_location = document.querySelector('#inp_location'),
        inp_item     = document.querySelector('#inp_item'),
        inp_size     = document.querySelector('#inp_size');
    sel_items.setAttribute('size', 10);
    sel_items.value = '';
    sel_sizes.setAttribute('size', 10);
    sel_sizes.value = '';
    if (inp_location) inp_location.value = '';
    div_size.classList.add('hidden');
    div_sizes.classList.add('hidden');
    inp_item.value = '';
    inp_size.value = '';
    getItems();
};
function getItems() {
    get(
        function (items, options) {
            let sel_items = document.querySelector('#sel_items');
            if (sel_items) {
                sel_items.innerHTML = '';
                items.forEach(item => {
                    sel_items.appendChild(
                        new Option({
                            text: item._description,
                            value: item.item_id
                        }).e
                    );
                });
            } else console.log('sel_items not found');
        },
        {
            table: 'items',
            query: []
        }
    );
};
function getSizes(event) {
    let query = [`item_id=${event.target.value}`]
    if      (path[2] === 'orders') query.push('_orderable=1')
    else if (path[2] === 'issues' ||path[2] === 'requests') query.push('_issueable=1')
    get(
        function (sizes, options) {
            let sel_sizes = document.querySelector('#sel_sizes'),
                div_sizes = document.querySelector('#div_sizes'),
                sel_items = document.querySelector('#sel_items');
            if (sel_sizes) {
                sel_sizes.innerHTML = '';
                if (div_sizes) div_sizes.classList.remove('hidden');
                if (sel_items) sel_items.removeAttribute('size');
                sizes.forEach(size => {
                    sel_sizes.appendChild(
                        new Option({
                            text: size._size,
                            value: size.size_id
                        }).e
                    );
                });
            } else console.log('sel_sizes note found');
        },
        {
            table: 'sizes',
            query: query
        }
    );
};
function getSize() {
    let _qty = document.querySelector('#size_add_qty');
    if (_qty) {
        _qty.value = '1';
        if (path[2] === 'receipts' || path[2] === 'issues') {
            let sel_sizes = document.querySelector('#sel_sizes') || {value: '-1'};
            get(
                function (size, options) {
                    let div_serials   = document.querySelector('#div_serials'),
                        div_locations = document.querySelector('#div_locations');
                    if (div_serials && div_locations) {
                        div_serials.innerHTML   = '';
                        div_locations.innerHTML = '';
                        if (size._serials) {
                            div_serials.classList.remove('hidden');
                            div_locations.classList.add('hidden');
                            if (path[2] === 'receipts') {
                                get(
                                    function (locations, options) {
                                        let opts = [{text: 'Select location', selected: true}];
                                        locations.forEach(e => {
                                            opts.push({value: e.location_id, text: e._location})
                                        });
                                        for (let i = 0; i < Number(_qty.value); i++) {
                                            div_serials.appendChild(
                                                new Input_Group({
                                                    title: `Enter Serial #: ${i + 1}`,
                                                    append: new Input({
                                                        attributes: [
                                                            {field: 'name',         value: `line[serials][][${i}][serial_id]`},
                                                            {field: 'autocomplete', value: 'off'}
                                                        ]
                                                    }).e
                                                }).e
                                            );
                                            div_serials.appendChild(
                                                new Input_Group({
                                                    title: `Select Location: ${i + 1}`,
                                                    append: new Select({
                                                        attributes: [
                                                            {field: 'name', value: `line[serials][][${i}][location_id]`},
                                                            {field: 'size', value: 3}
                                                        ],
                                                        options: opts
                                                    }).e
                                                }).e
                                            );
                                            div_serials.appendChild(
                                                new Input_Group({
                                                    title: `Enter Location: ${i + 1}`,
                                                    append: new Input({
                                                        attributes: [
                                                            {field: 'name',         value: `line[serials][][${i}][location]`},
                                                            {field: 'autocomplete', value: 'off'}
                                                        ]
                                                    }).e
                                                }).e
                                            );
                                            div_serials.appendChild(document.createElement('hr'))
                                        };
                                    },
                                    {
                                        table: 'locations',
                                        query: []
                                    }
                                );
                            } else if (path[2] === 'issues') {
                                get(
                                    function (serials, options) {
                                        let opts = [];
                                        serials.forEach(serial => {
                                            opts.push({value: serial.serial_id, text: `${serial._serial} | Location: ${serial.location._location}`});
                                        });
                                        for (let i = 0; i < Number(_qty.value); i++) {
                                            div_serials.appendChild(
                                                new Input_Group({
                                                    title: `Select Serial: ${i + 1}`,
                                                    append: new Select({
                                                        attributes: [
                                                            {field: 'name',     value: `line[serials][][${i}][serial_id]`},
                                                            {field: 'size',     value: 3},
                                                            {field: 'required', value: true}
                                                        ],
                                                        options: opts
                                                    }).e
                                                }).e
                                            );
                                            div_serials.appendChild(document.createElement('hr'))
                                        };
                                    },
                                    {
                                        table: 'serials',
                                        query: [`size_id=${sel_sizes.value}`]
                                    }
                                );
                            };
                        } else {
                            div_serials.classList.add('hidden');
                            div_locations.classList.remove('hidden');
                            get(
                                function (locations, options) {
                                    let opts = [{text: 'Select location', selected: true}];
                                    locations.forEach(e => {
                                        opts.push({value: e.location_id, text: e._location})
                                    });
                                    div_serials.appendChild(
                                        new Input_Group({
                                            title: 'Select Location:',
                                            append: new Select({
                                                attributes: [
                                                    {field: 'name', value: 'line[location_id]'},
                                                    {field: 'size', value: 3}
                                                ],
                                                options: opts
                                            }).e
                                        }).e
                                    );
                                    div_serials.appendChild(
                                        new Input_Group({
                                            title: 'Enter Location:',
                                            append: new Input({
                                                attributes: [
                                                    {field: 'name',         value: `line[location]`},
                                                    {field: 'autocomplete', value: 'off'}
                                                ]
                                            }).e
                                        }).e
                                    );
                                    div_serials.appendChild(document.createElement('hr'));
                                },
                                {
                                    table: 'locations',
                                    query: []
                                }
                            );
                        };
                    };
                },
                {
                    table: 'size',
                    query: [`size_id=${sel_sizes.value}`]
                }
            );
        };
    };
};
function show_details() {
    let sel_sizes = document.querySelector('#sel_sizes'),
        div_size  = document.querySelector('#div_size');
    if (sel_sizes) {
        if (div_size) div_size.classList.remove('hidden');
        if (sel_sizes) sel_sizes.removeAttribute('size');
    } else console.log('sel_sizes not found');
};
function getLocations() {
    get(
        function (stocks, options) {
            let sel_locations = document.querySelector('#sel_locations');
            if (sel_locations) {
                stocks.forEach(stock => {
                    sel_locations.appendChild(
                        new Option({
                            value: stock.location_id,
                            text: stock.location._location
                        }).e
                    );
                });
            };
        },
        {
            table: 'stocks',
            query: [`size_id=${sel_sizes.value}`]
        }
    );
};