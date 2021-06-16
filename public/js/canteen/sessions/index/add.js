window.addEventListener('load', function () {
    addFormListener(
        'session_add',
        'POST',
        `/sessions`,
        {onComplete: [
            getSessions,
            function () {modalHide('session_add')}
        ]}
    );
});