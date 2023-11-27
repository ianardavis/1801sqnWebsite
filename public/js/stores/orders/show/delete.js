function setDeleteButton() {
    get({
        table: 'order',
        where: {order_id: path[2]}
    })
    .then(function([result, options]) {
        disableButton('delete');
        if ([1, 2, 3].includes(result.status)) enableButton('delete');
    });
};
window.addEventListener( "load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/orders/${path[2]}`,
        {
            onComplete: [
                getOrder,
                function() {if (typeof showActions === 'function') {showActions()}}
            ]
        }
    );
    setDeleteButton();
});