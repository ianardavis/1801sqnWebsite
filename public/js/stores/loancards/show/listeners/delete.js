window.addEventListener( "load", function () {
    enable_button('delete');
    addFormListener(
        'delete',
        'DELETE',
        `/loancards/${path[2]}`,
        {
            onComplete: [
                getLoancard,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
});