window.addEventListener('load', function () {
    addFormListener(
        'session_add',
        'POST',
        `/sessions`,
        {onComplete: function () {window.location.replace('/pos')}}
    );
});