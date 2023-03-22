function Card(options = {}) {
    this.e       = document.createElement('div');
    let a        = document.createElement('a');
    let header   = document.createElement('div');
    let title    = document.createElement('h3');
    let body     = document.createElement('div');
    let subtitle = document.createElement('p');

    this.e.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3');

    a.setAttribute('href', options.href);
    a.classList.add('card', 'mb-3', 'text-start');

    header.classList.add('card-header', 'h-100-px');

    title.classList.add('card-title');
    title.innerText = options.title;
    header.appendChild(title);

    if (options.subtitle) {
        subtitle.classList.add('card-subtitle', 'text-muted', 'f-10');
        subtitle.setAttribute('id', options.subtitle.id);
        header.appendChild(subtitle);
    };

    body.classList.add('card-body');
    if (options.body) {
        body.setAttribute(`data-${options.body.data.field}`, options.body.data.value);
    };
    if (options.text) body.innerText = options.text;

    a.appendChild(header);
    a.appendChild(body);
    this.e.appendChild(a);
};