function approve_radio(id, index, func = null) {
    return new Radio({
        id:          `${id}_decline`,
        float_start: true,
        classes:     ['radio_decline'],
        colour:      'danger',
        html:        '<i class="fas fa-times-circle"></i>',
        tip:         'Approve',
        attributes: [
            {field: 'name',  value: `lines[][${index}][status]`},
            {field: 'value', value: '2'}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};
function decline_radio(id, index, func = null) {
    return new Radio({
        id:          `${id}_approve`,
        float_start: true,
        classes:     ['radio_approve'],
        colour:      'success',
        html:        '<i class="fas fa-times-circle"></i>',
        tip:         'Decline',
        attributes: [
            {field: 'name',  value: `lines[][${index}][status]`},
            {field: 'value', value: '-1'}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e
};