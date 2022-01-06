function nil_radio(id, index, func = null) {
    return new Radio({
        id:          `${id}_nil`,
        float_start: true,
        classes:     ['radio_nil'],
        colour:      'primary',
        html:        '<i class="fas fa-question"></i>',
        tip:         'Nil',
        attributes: [
            {field: 'name',    value: `lines[][${index}][status]`},
            {field: 'data-id', value: id},
            {field: 'checked', value: true}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};
function cancel_radio(id, index, func = null) {
    return new Radio({
        id:          `${id}_cancel`,
        float_start: true,
        classes:     ['radio_cancel'],
        colour:      'danger',
        html:        '<i class="fas fa-trash-alt"></i>',
        tip:         'Cancel',
        attributes: [
            {field: 'name',    value: `lines[][${index}][status]`},
            {field: 'value',   value: '0'},
            {field: 'data-id', value: id}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};