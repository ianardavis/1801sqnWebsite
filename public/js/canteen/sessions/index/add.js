window.addEventListener('load', function () {
    addFormListener(
        'add_session',
        'POST',
        `/canteen/sessions`,
        {onComplete: [
            getSessions,
            function () {modalHide('session_add')}
        ]}
    );
});