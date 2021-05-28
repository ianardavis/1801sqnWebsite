function setCompleteButton() {
    get({
        table: 'demand',
        query: [`demand_id=${path[2]}`]
    })
    .then(function([demand, options]) {
        if (demand.status === 1) enable_button('complete')
        else                     disable_button('complete');
        if (demand.status === 2) enable_button('close')
        else                     disable_button('close');
    });
};
window.addEventListener( "load", function () {
    setCompleteButton();
    addFormListener(
        'complete',
        'PUT',
        `/demands/${path[2]}/complete`,
        {
            onComplete: [
                getDemand,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
    addFormListener(
        'close',
        'PUT',
        `/demands/${path[2]}/close`,
        {
            onComplete: [
                getDemand,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
});