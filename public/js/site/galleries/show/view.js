function getGallery() {
    get({
        table: 'gallery',
        query: [`gallery_id=${path[2]}`]
    })
    .then(function ([gallery, options]) {
        set_innerText({id: 'gallery_name',      value: gallery.name});
        set_innerText({id: 'gallery_createdAt', value: print_date(gallery.createdAt, true)});
        set_innerText({id: 'gallery_user',      value: print_user(gallery.user)});
    });
};
window.addEventListener('load', function () {
    document.querySelectorAll('.gallery_id').forEach(e => e.setAttribute('value', path[2]));
});