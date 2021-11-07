window.addEventListener( "load", function () {
    setDeleteButton();
    addFormListener(
        'delete',
        'DELETE',
        `/demands/${path[2]}`,
        {
            onComplete: [
                getDemand,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
});
function setDeleteButton() {
    get({
        table: 'demand',
        query: [`"demand_id":"${path[2]}"`]
    })
    .then(function([demand, options]) {
        if ([1, 2].includes(demand.status)) enable_button('delete')
        else                                disable_button('delete');
    });
};