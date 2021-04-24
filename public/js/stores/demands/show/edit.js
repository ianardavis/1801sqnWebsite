window.addEventListener( "load", function () {
    addFormListener(
        'complete',
        'PUT',
        `/demands/${path[2]}`,
        {
            onComplete: [
                getDemand,
                function () {if (typeof getLines === 'function') getLines('demand')}
            ]
        }
    );
    addFormListener(
        'raise',
        'PUT',
        `/demands/raise/${path[2]}`,
        {
            onComplete: [
                getDemand,
                function () {if (typeof getLines === 'function') getLines('demand')}
            ]
        }
    );
});