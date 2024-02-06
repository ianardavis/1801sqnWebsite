window.addEventListener('load', function () {
    enableButton('site_add');
    addFormListener(
        'site_add',
        'POST',
        '/sites',
        {onComplete: getSites}
    );
});