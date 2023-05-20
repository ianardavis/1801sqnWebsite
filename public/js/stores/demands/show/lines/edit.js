window.addEventListener( "load", function () {
    addFormListener(
        'lines',
        'PUT',
        '/demand_lines',
        {
            onComplete: [
                get_lines,
                get_demand
            ]
        }
    );
});