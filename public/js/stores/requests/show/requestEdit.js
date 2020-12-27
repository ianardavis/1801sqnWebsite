function setRequestButtons() {
    get(
        function(request, options) {
            ['complete', 'delete'].forEach(e => set_attribute({id: `btn_${e}`, attribute: 'disabled', value: true}));
            if (request._status === 1) {
                ['complete', 'delete'].forEach(e => remove_attribute({id: `btn_${e}`, attribute: 'disabled'}));
            } else if (request._status === 2) {
                remove_attribute({id: 'btn_action', attribute: 'disabled'});
            };
        },
        {
            table: 'request',
            query: [`request_id=${path[3]}`]
        }
    );
};