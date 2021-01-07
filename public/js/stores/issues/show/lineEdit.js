function getLineActions() {
    let actions = document.querySelectorAll('.actions');
    actions.forEach(e => {
        get(
            function (line, options) {
                if (line._status === 2) {
                    let opts = [],
                        div_actions = document.createElement('div'),
                        div_action  = document.createElement('div'),
                        div_details = document.createElement('div');
                    opts.push({text: 'Issued', selected: true});
                    opts.push({text: 'Return', value: '3'});
                    let _status = new Select({
                        attributes: [{field: 'id', value: `sel_${line.line_id}`}],
                        options:    opts,
                        small:      true
                    }).e;
                    _status.addEventListener("change", function () {
                        clearElement(`action_${line.line_id}`);
                        clearElement(`details_${line.line_id}`);
                        if (this.value === '3') {
                            div_action.appendChild(
                                new Hidden({
                                    attributes: [
                                        {field: 'name',  value: `actions[${line.line_id}][_status]`},
                                        {field: 'value', value: '3'}
                                    ]
                                }).e
                            );
                            div_action.appendChild(
                                new Hidden({
                                    attributes: [
                                        {field: 'name',  value: `actions[${line.line_id}][line_id]`},
                                        {field: 'value', value: line.line_id}
                                    ]
                                }).e
                            );
                            getStock(line.size_id, line.line_id, 'details', true);
                        };
                    });
                    div_action.setAttribute( 'id', `action_${line.line_id}`);
                    div_details.setAttribute('id', `details_${line.line_id}`);
                    div_actions.appendChild(_status);
                    div_actions.appendChild(div_action);
                    div_actions.appendChild(div_details);
                    e.innerText = '';
                    e.appendChild(div_actions);
                };
            },
            {
                table: 'issue_line',
                query: [`line_id=${e.dataset.line_id}`]
            }
        );
    });
};
window.addEventListener( "load", function () {
    addFormListener(
        'form_action',
        'PUT',
        `/stores/issue_lines/${path[3]}`,
        {onComplete: getLines}
    );
});