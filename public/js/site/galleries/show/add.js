window.addEventListener('load', function () {
    addFormListener(
        'image_add',
        'POST',
        '/gallery_images',
        {onComplete: getImages}
    )
});