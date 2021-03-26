function setDeleteButton() {
    get(
        {
            table: 'order',
            query: [`order_id=${path[2]}`]
        },
        function(result, options) {
            set_attribute({id: `btn_delete`, attribute: 'disabled', value: true});
            if (result._status === 1 || result._status === 2 || result._status === 3) remove_attribute({id: `btn_delete`, attribute: 'disabled'});
        }
    );
};
window.addEventListener( "load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/stores/orders/${path[2]}`,
        {
            onComplete: [
                showOrder,
                function() {if (typeof showActions === 'function') {showActions()}}
            ]
        }
    );
});