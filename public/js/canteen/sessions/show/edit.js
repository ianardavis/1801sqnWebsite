function enable_close_button(status) {
    if (status === 1) enableButton('session_close')
    else disableButton('session_close')
};
window.addEventListener('load', function () {
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