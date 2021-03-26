function setButtons() {
    get(
        {
            table: 'loancard',
            query: [`loancard_id=${path[2]}`]
        },
        function(result, options) {
            ['complete', 'delete'].forEach(e => set_attribute({id: `btn_${e}`, attribute: 'disabled', value: true}));
            if      (result._status === 1) ['complete', 'delete'].forEach(e => remove_attribute({id: `btn_${e}`, attribute: 'disabled'}));
            else if (result._status === 2) remove_attribute({id: 'btn_action', attribute: 'disabled'});
        }
    );
};