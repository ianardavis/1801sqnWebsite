window.addEventListener("load", function () {
    addFormListener(
        'raise',
        'PUT',
        `/loancards/raise/${path[2]}`,
        {
            onComplete: [
                getLoancard,
                function () {
                    if (typeof getLines === 'function') getLines('loancard');
                    download('loancards', path[2]);
                }
            ]
        }
    );
});