window.addEventListener('load', function () {
    addFormListener(
        'gallery_add',
        'POST',
        '/galleries',
        {onComplete: getGalleries}
    )
});