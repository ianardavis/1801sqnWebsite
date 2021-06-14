window.addEventListener('load', function () {
    addFormListener(
        'close',
        'PUT',
        `/sessions/${path[2]}`,
        {
            onComplete: [
                function () {modalHide('session_close')},
                function () {
                    if (typeof getSales === 'function') getSales();
                },
                getSession
            ]
        }
    )
});