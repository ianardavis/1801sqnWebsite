window.addEventListener('load', function () {
    enable_button('session_close');
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