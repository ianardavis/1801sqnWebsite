window.addEventListener('load', function () {
    enable_button('session_close');
    addFormListener(
        'session_close',
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