function set_image_id_delete() {
    let image = document.querySelector('.carousel-inner .active');
    if (image) set_value({id: 'image_id_delete', value: image.dataset.id})
};
window.addEventListener('load', function () {
    addListener('btn_image_delete', set_image_id_delete)
    addFormListener(
        'image_delete',
        'DELETE',
        '/gallery_images',
        {onComplete: getImages}
    )
});