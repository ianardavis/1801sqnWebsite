function setButtons() {
    get(
        function(result, options) {
            ['complete', 'delete'].forEach(e => set_attribute({id: `btn_${e}`, attribute: 'disabled', value: true}));
            if      (result._status === 1) ['complete', 'delete'].forEach(e => remove_attribute({id: `btn_${e}`, attribute: 'disabled'}));
            else if (result._status === 2) remove_attribute({id: 'btn_action', attribute: 'disabled'});
        },
        {
            table: 'request',
            query: [`request_id=${path[3]}`]
        }
    );
};
window.addEventListener( "load", function () {
    addFormListener(
        'form_complete',
        'PUT',
        `/stores/requests/${path[3]}`,
        {
            onComplete: [
                showRequest,
                showLines
            ]
        }
    );
});