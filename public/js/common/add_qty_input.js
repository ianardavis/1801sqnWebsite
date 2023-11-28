function add_qty_input(divDetails, index, qty) {
    divDetails.appendChild(new Number_Input({
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