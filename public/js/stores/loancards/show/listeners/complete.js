window.addEventListener( "load", function () {
    addFormListener(
        'complete',
        'PUT',
        `/stores/loancards/${path[2]}`,
        {
            onComplete: [
                getLoancard,
                function () {if (typeof getLines === 'function') getLines('loancard')}
            ]
        }
    );
});