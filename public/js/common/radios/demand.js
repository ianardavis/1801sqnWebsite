function demand_radio(id, index, func = null) {
    return new Radio({
        id:          `${id}_demand`,
        // float_start: true,
        classes:     ['radio_demand'],
        colour:      'warning',
        html:        '<i class="fas fa-industry"></i>',
        tip:         'Demand',
        attributes: [
            {field: 'name',       value: `lines[][${index}][status]`},
            {field: 'value',      value: '2'},
            {field: 'data-id',    value: id},
            {field: 'data-index', value: index}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};