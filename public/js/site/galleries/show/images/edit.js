function viewImage() {
    let image = document.querySelector('.carousel-inner .active');
    if (image) {
        get({
            table: 'gallery_image',
            where: {image_id: image.dataset.id}
        })
        .then(function ([image, options]) {
            set_value('image_id_edit',          image.image_id)
            set_value('image_title_edit',       image.title);
            set_value('image_description_edit', image.description);
        });
    };
};
window.addEventListener('load', function () {
    modalOnShow('image_edit', viewImage);
    addFormListener(
        'image_edit',
        'PUT',
        '/gallery_images',
        {onComplete: [
            getImages,
            function () {modalHide('image_edit')}
        ]}
    )
});