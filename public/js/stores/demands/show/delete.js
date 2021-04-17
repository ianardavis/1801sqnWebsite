window.addEventListener( "load", function () {
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