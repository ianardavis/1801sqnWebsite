function setLineButtons(table) {
    get(
        function(result, options) {
            ['action', 'sizeSelect'].forEach(e => set_attribute({id: `btn_${e}`, attribute: 'disabled', value: true}));
            if      (result._status === 1) remove_attribute({id: `btn_sizeSelect`, attribute: 'disabled'});
            else if (result._status === 2) remove_attribute({id: 'btn_action',     attribute: 'disabled'});
        },
        {
            table: table,
            query: [`${table}_id=${path[3]}`]
        }
    );
};