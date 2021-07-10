function viewImage() {
    let image = document.querySelector('.carousel-inner .active');
    if (image) {
        get({
            table: 'gallery_image',
            query: [`image_id=${image.dataset.id}`]
        })
        .then(function ([image, options]) {
            set_value({id: 'image_id_edit',          value: image.image_id})
            set_value({id: 'image_title_edit',       value: image.title});
            set_value({id: 'image_description_edit', value: image.description});
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