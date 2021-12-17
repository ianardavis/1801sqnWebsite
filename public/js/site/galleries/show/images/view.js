function Indicator(index) {
    this.e = document.createElement('button');
    this.e.setAttribute('type', 'button');
    this.e.setAttribute('data-bs-target', '#car_images');
    this.e.setAttribute('data-bs-slide-to', index);
    this.e.setAttribute('aria-label', `Slide ${index}`);
    if (index === 0) {
        this.e.classList.add('active');
        this.e.setAttribute('aria-current', 'true');
    };
};
function CarouselItem(options = {}) {
    this.e = document.createElement('div');
    this.e.classList.add('carousel-item');
    this.e.setAttribute('data-id', options.image_id)
    if (options.index === 0) this.e.classList.add('active');
    let img = document.createElement('img');
    img.setAttribute('src', `/res/images/${options.src}`);
    img.classList.add('d-block', 'w-80', 'mx-auto');
    img.setAttribute('alt', options.title);
    let caption = document.createElement('div');
    caption.classList.add('carousel-caption', 'd-none', 'd-md-block');
    let h5 = document.createElement('h5'),
        p  = document.createElement('p');
    h5.innerText = options.title;
    p.innerText  = options.description;
    caption.appendChild(h5);
    caption.appendChild(p);
    this.e.appendChild(img);
    this.e.appendChild(caption);
};
function getImages() {
    clear('div_indicators')
    .then(div_indicators => {
        clear('div_images')
        .then(div_images => {
            get({
                table: 'gallery_images',
                where: {gallery_id: path[2]}
            })
            .then(function ([images, options]) {
                let index = 0;
                images.forEach(image => {
                    div_indicators.appendChild(new Indicator(index).e);
                    div_images.appendChild(new CarouselItem({
                        index:       index,
                        src:         image.src,
                        title:       image.title,
                        description: image.description,
                        image_id:    image.image_id
                    }).e);
                    index++
                });
            });
        });
    })
};