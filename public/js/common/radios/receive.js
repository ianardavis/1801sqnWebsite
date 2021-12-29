function receive_radio(id, index, func = null) {
    return new Radio({
        id:          `${id}_receive`,
        float_start: true,
        classes:     ['radio_receive'],
        colour:      'success',
        html:        '<i class="fas fa-receipt"></i>',
        attributes: [
            {field: 'name',       value: `lines[][${index}][status]`},
            {field: 'value',      value: '3'},
            {field: 'data-id',    value: id},
            {field: 'data-index', value: index}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};