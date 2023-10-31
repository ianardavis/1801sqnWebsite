function nil_radio(id, index){
    return new Radio({
        id:      `nil_${id}`,
        classes: ['radio_nil'],
        colour:  'primary',
        html:    '<i class="fas fa-question"></i>',
        tip:     'Nil',
        attributes: [
            {field: 'name',    value: `lines[][${index}][status]`},
            {field: 'value',   value: ''},
            {field: 'data-id', value: id},
            {field: 'checked', value: true}
        ],
        listener: {event: 'input', func: function () {clear(`details_${id}`)}}
    }).e;
};
function cancel_radio(id, index, func = null, value = '0') {
    return new Radio({
        id:      `cancel_${id}`,
        classes: ['radio_cancel'],
        colour:  'danger',
        html:    '<i class="fas fa-trash-alt"></i>',
        tip:     'Cancel',
        attributes: [
            {field: 'name',       value: `lines[][${index}][status]`},
            {field: 'value',      value: value},
            {field: 'data-id',    value: id},
            {field: 'data-index', value: index}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};