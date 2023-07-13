window.addEventListener( "load", function () {
    addFormListener(
        'delete',
        'DELETE',
        `/demands/${path[2]}`,
        {
            onComplete: [
                get_demand,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
});