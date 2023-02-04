function nil_radio(id, index){
    function clear_details() {
        let div_details = document.querySelector(`#details_${id}`);
        if (div_details) div_details.innerHTML = '';
    };
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
        listener: {event: 'input', func: clear_details}
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
            {field: 'name',    value: `lines[][${index}][status]`},
            {field: 'value',   value: value},
            {field: 'data-id', value: id}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};