function GalleryCard(options = {}) {
    this.e     = document.createElement('div');
    let a      = document.createElement('a'),
        header = document.createElement('div'),
        title  = document.createElement('h3'),
        body   = document.createElement('div');
    this.e.classList.add('col-6', 'col-lg-4', 'col-xl-3');
    a     .classList.add('card', 'm-3', 'text-start');
    header.classList.add('card-header');
    title .classList.add('card-title');
    body  .classList.add('card-body');
    a.setAttribute('href', options.href);
    title.innerText = options.title;
    header.appendChild(title);
    a.appendChild(header);
    a.appendChild(body);
    this.e.appendChild(a);
};
function getGalleries() {
    clear('div_galleries')
    .then(div_galleries => {
        get({table: 'galleries'})
        .then(function ([galleries, options]) {
            galleries.forEach(gallery => {
                div_galleries.appendChild(new GalleryCard({
                    href: `/galleries/${gallery.gallery_id}`,
                    title: gallery.name
                }).e);
            });
        });
    });
};