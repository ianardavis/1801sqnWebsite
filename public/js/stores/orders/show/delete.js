function setDeleteButton() {
    get({
        table: 'order',
        query: [`order_id=${path[2]}`]
    })
    .then(function([result, options]) {
        set_attribute({id: `btn_delete`, attribute: 'disabled', value: true});
        if ([1, 2, 3].includes(result.status)) enable_button('delete');
    });
};
window.addEventListener( "load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/orders/${path[2]}`,
        {
            onComplete: [
                showOrder,
                function() {if (typeof showActions === 'function') {showActions()}}
            ]
        }
    );
});