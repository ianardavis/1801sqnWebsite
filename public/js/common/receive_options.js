let receive_options = null;
function receive_option_func(table) {
    receive_options = function () {
        clear(`details_${this.dataset.id}`)
        .then(div_details => {
            if (this.value === '3') {
                div_details.appendChild(new Spinner(this.dataset.id).e);
                let where = {};
                where[`${table}_id`] = this.dataset.id;
                get({
                    table: table,
                    where: where,
                    index: this.dataset.index
                })
                .then(function ([line, options]) {
                    function add_serial_selects(i) {
                        div_details.appendChild(new Select({
                            attributes: [
                                {field: 'name',        value: `lines[][${options.index}][serials][][${i}][serial]`},
                                {field: 'required',    value: true},
                                {field: 'placeholder', value: `Serial ${i + 1}`}
                            ]
                        }).e);
                        div_details.appendChild(new Select({
                            attributes: [
                                {field: 'name',        value: `lines[][${options.index}][serials][][${i}][location]`},
                                {field: 'required',    value: true},
                                {field: 'placeholder', value: `Location ${i + 1}`}
                            ]
                        }).e);
                    };
                    function add_stock_selects() {
                        let list = document.createElement('datalist');
                        list.setAttribute('id', `loc_list_${options.index}`);
                        div_details.appendChild(new Text_Input({
                            attributes: [
                                {field: 'name',        value: `lines[][${options.index}][location]`},
                                {field: 'required',    value: true},
                                {field: 'list',        value: `loc_list_${options.index}`},
                                {field: 'placeholder', value: 'Enter Location...'}
                            ]
                        }).e);
                        div_details.appendChild(list);
                        get({
                            table: 'stocks',
                            where: {size_id: line.size_id}
                        })
                        .then(function ([result, options]) {
                            result.stocks.forEach(e => list.appendChild(new Option({value: e.location.location}).e));
                        });
                        div_details.appendChild(new Number_Input({
                            attributes: [
                                {field: 'min',         value: '1'},
                                {field: 'placeholder', value: 'Receipt Quantity'},
                                {field: 'name',        value: `lines[][${options.index}][qty]`},
                                {field: 'required',    value: true},
                                {field: 'value',       value: line.qty}
                            ]
                        }).e);
                    };
                    if ([1,2].includes(line.status)) {
                        if (line.size.has_serials) {
                            for (let i = 0; i < line.qty; i++) {
                                add_serial_selects(i);
                            };

                        } else {
                            add_stock_selects();

                        };

                    };
                    remove_spinner(line[`${table}_id`]);
                });

            };
        });
    };
};