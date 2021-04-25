window.addEventListener( "load", function () {
    addFormListener(
        'complete',
        'PUT',
        `/demands/${path[2]}`,
        {
            onComplete: [
                getDemand,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
});
function setButtons() {
    get({
        table: 'demand',
        query: [`demand_id=${path[2]}`]
    })
    .then(function([demand, options]) {
        if (demand.status === 1) {
            enable_button('complete');
            enable_button('delete');
        } else {
            disable_button('complete');
            disable_button('delete');
        };
    });
};