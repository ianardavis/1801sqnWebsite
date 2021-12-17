function getGallery() {
    get({
        table: 'gallery',
        where: {gallery_id: path[2]}
    })
    .then(function ([gallery, options]) {
        set_innerText('gallery_name',      gallery.name);
        set_innerText('gallery_createdAt', print_date(gallery.createdAt, true));
        set_innerText('gallery_user',      print_user(gallery.user));
    });
};
window.addEventListener('load', function () {
    document.querySelectorAll('.gallery_id').forEach(e => e.setAttribute('value', path[2]));
});