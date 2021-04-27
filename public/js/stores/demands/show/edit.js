window.addEventListener( "load", function () {
    setCompleteButton();
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
function setCompleteButton() {
    get({
        table: 'demand',
        query: [`demand_id=${path[2]}`]
    })
    .then(function([demand, options]) {
        if (demand.status === 1) enable_button('complete');
        else                     disable_button('complete');
    });
};