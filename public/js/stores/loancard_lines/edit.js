function return_options() {
    clear(`${this.dataset.id}_details`)
    .then(div_details => {
        if (this.value === '3') {
            get({
                table: 'loancard_line',
                where: {loancard_line_id: this.dataset.id},
                index: this.dataset.index
            })
            .then(function ([line, options]) {
                if (line.status === 2) {
                    if (line.size.has_serials) {
                        get({
                            table: 'current_serials',
                            where: {size_id: line.size_id},
                            index: options.index
                        })
                        .then(function ([serials, options]) {
                            let serial_options = [{text: 'Select Serial #'}];
                            serials.forEach(e => serial_options.push({text: e.serial, value: e.serial_id}));
                            for (let i = 0; i < line.qty; i++) {
                                div_details.appendChild(new Select({
                                    attributes: [
                                        {field: 'name',     value: `lines[][${options.index}][serials][][${i}][serial_id]`},
                                        {field: 'required', value: true}
                                    ],
                                    options: serial_options
                                }).e);
                            };
                        });
                    } else {
                        let location = new Input({
                            attributes: [
                                {field: 'name',        value: `lines[][${options.index}][location]`},
                                {field: 'required',    value: true},
                                {field: 'placeholder', value: 'Location'},
                                {field: 'list',        value: `locations_${options.index}`}
                            ],
                            options: [{text: 'Select Location'}]
                        }).e;
                        let stock_qty = new Input({
                            attributes: [
                                {field: 'type',        value: 'number'},
                                {field: 'min',         value: '1'},
                                {field: 'max',         value: line.qty},
                                {field: 'value',       value: line.qty},
                                {field: 'Placeholder', value: 'Quantity'},
                                {field: 'name',        value: `lines[][${options.index}][qty]`},
                                {field: 'required',    value: true}
                            ]
                        }).e;
                        div_details.appendChild(location);
                        div_details.appendChild(stock_qty);
                        get({
                            table: 'stocks',
                            where: {size_id: line.size_id},
                            index: options.index
                        })
                        .then(function ([stocks, options]) {
                            let locations_list = document.createElement('datalist'), locs = [];
                            locations_list.setAttribute('id', `locations_${options.index}`);
                            stocks.forEach(e => {
                                if (!locs.includes(e.location.location)) {
                                    locs.push(e.location.location);
                                    locations_list.appendChild(new Option({value: e.location.location}).e)
                                };
                                div_details.appendChild(locations_list);
                            });
                        });
                    };
                };
            });
        };
    })
};
window.addEventListener( "load", function () {
    addFormListener(
        'actions',
        'PUT',
        '/loancard_lines',
        {onComplete: [
            getLines,
            function () {if (typeof getLoancard === 'function') getLoancard()}
        ]}
    );
});