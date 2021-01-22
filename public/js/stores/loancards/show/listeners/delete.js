window.addEventListener( "load", function () {
    addFormListener(
        'form_delete',
        'DELETE',
        `/stores/loancards/${path[3]}`,
        {
            onComplete: [
                getLoancard,
                function () {if (typeof getLines === 'function') getLines()}
            ]
        }
    );
});