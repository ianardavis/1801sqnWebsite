function order_radio(id, index, func = null) {
    return new Radio({
        id:          `${id}_order`,
        float_start: true,
        classes:     ['radio_order'],
        colour:      'warning',
        html:        '<i class="fas fa-industry"></i>',
        tip:         'Order',
        attributes: [
            {field: 'name',    value: `lines[][${index}][status]`},
            {field: 'value',   value: '3'},
            {field: 'data-id', value: id}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};