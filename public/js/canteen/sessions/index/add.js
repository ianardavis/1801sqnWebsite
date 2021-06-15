window.addEventListener('load', function () {
    addFormListener(
        'add_session',
        'POST',
        `/sessions`,
        {onComplete: [
            getSessions,
            function () {modalHide('session_add')}
        ]}
    );
});