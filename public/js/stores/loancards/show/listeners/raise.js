window.addEventListener("load", function () {
    addFormListener(
        'form_raise',
        'PUT',
        `/stores/loancards/raise/${path[3]}`,
        {
            onComplete: [
                getLoancard,
                function () {
                    if (typeof getLines === 'function') getLines('loancard');
                    download('loancards', path[3]);
                }
            ]
        }
    );
});