window.addEventListener( "load", function () {
    addFormListener(
        'form_complete',
        'PUT',
        `/stores/loancards/${path[3]}`,
        {
            onComplete: [
                getLoancard,
                function () {if (typeof getLines === 'function') getLines('loancard')}
            ]
        }
    );
});