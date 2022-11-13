function restore_radio(id, index, func = null) {
    return new Radio({
        id:          `${id}_restore`,
        // float_start: true,
        classes:     ['radio_restore'],
        colour:      'success',
        html:        '<i class="fas fa-trash-restore-alt"></i>',
        tip:         'Restore',
        attributes: [
            {field: 'name',    value: `lines[][${index}][status]`},
            {field: 'value',   value: '-3'},
            {field: 'data-id', value: id}
        ],
        ...(typeof func === 'function' ? {listener: {event: 'input', func: func}} : {})
    }).e;
};