function order_radio(issue_id, index) {
    return new Radio({
        id: `${issue_id}_order`,
        float_start: true,
        classes: ['radio_order'],
        colour: 'warning',
        html: '<i class="fas fa-industry"></i>',
        attributes: [
            {field: 'name',          value: `issues[][${index}][status]`},
            {field: 'value',         value: '3'},
            {field: 'data-issue_id', value: issue_id},
            {field: 'disabled',      value: true}
        ],
        listener: {event: 'input', func: function () {clear(`${this.dataset.issue_id}_details`)}}
    }).e;
};