window.addEventListener('load', function () {
    addFormListener(
        'image_delete',
        'DELETE',
        '/gallery_images',
        {onComplete: getImages}
    )
});