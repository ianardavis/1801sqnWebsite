function issue_radio(id, index, func = null) {
    return new Radio({
        id:      `${id}_issue`,
        classes: ['radio_issue'],
        colour:  'success',
        html:    '<i class="fas fa-address-card"></i>',
        tip:     'Add to Loancard',
        attributes: [
            {field: 'name',       value: `lines[][${index}][status]`},
            {field: 'value',      value: '4'},
            {field: 'data-id',    value: id},
            {field: 'data-index', value: index}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};
function loancard_radio(id, index, func = null) {
    return new Radio({
        id:      `${id}_issue`,
        classes: ['radio_issue'],
        colour:  'danger',
        html:    '<i class="fas fa-address-card"></i>',
        tip:     'Remove from loancard',
        attributes: [
            {field: 'name',       value: `lines[][${index}][status]`},
            {field: 'value',      value: '-2'},
            {field: 'data-id',    value: id},
            {field: 'data-index', value: index}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};