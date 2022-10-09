function return_radio(id, index, func = null) {
    return new Radio({
        id:          `${id}_return`,
        float_start: true,
        classes:     ['radio_return'],
        colour:      'secondary',
        html:        '<i class="fas fa-undo-alt"></i>',
        tip:         'Return',
        attributes: [
            {field: 'name',      value: `lines[][${index}][status]`},
            {field: 'value',     value: '3'},
            {field: 'data-id',   value: id},
            {field: 'data-index',value: index}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e
};