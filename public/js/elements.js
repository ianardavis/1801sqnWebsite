function _check()  {return '<i class="fas fa-check"></i>'}
function _search() {return '<i class="fas fa-search"></i>'}
function _globe()  {return '<i class="fas fa-globe-europe"></i>'}
function _edit()   {return '<i class="fas fa-pencil-alt"></i>'}//
function _save()   {return '<i class="fas fa-save"></i>'}
function _move(attribute = '')   {return `<i class="fas fa-align-justify"${attribute}></i>`}
function _copy()   {return '<i class="fas fa-clipboard"></i>'}
function _delete() {return '<i class="fas fa-trash-alt"></i>'}
function random_id() {return Math.floor(Math.random()*10000)};

function List_Item(options = {}) {
    this.e = document.createElement('li');
    this.e.classList.add('list-group-item', 'text-start', 'p-4');
    this.e.appendChild(
        new Checkbox({
            attributes: [
                {field: 'id',    value: `permission_${options.text}`},
                {field: 'name',  value: 'permissions[]'},
                {field: 'value', value: options.text}
            ],
            small: true,
            float: true
        }).e
    );
    let span = document.createElement('span'),
        ul   = document.createElement('ul');
    span.innerText = options.text.replaceAll('_', ' ') || '';
    span.classList.add('caret');
    this.e.appendChild(span);
    ul.classList.add('nested', 'list-group');
    ul.setAttribute('id', `ul_${options.text}`);
    this.e.appendChild(ul);
};
function Category_LI(options = {}) {
    this.e = document.createElement('li');
    this.e.setAttribute('data-id', options.li_id || random_id);
    this.e.classList.add('list-group-item', 'text-start', 'category_li', 'my-1');
    let span = document.createElement('span'),
        ul   = document.createElement('ul');
    span.innerText = options.text || '';
    span.classList.add('caret'); ///////////////////////////// 
    span.classList.add('ms-3');
    span.setAttribute('id', `caret_${options.li_id}`)
    this.e.appendChild(new Link({
        type: 'move',
        type_attribute: `data-id="${options.li_id || ''}"`,
        data: {field: 'id', value: options.li_id || ''},
        small: true,
        classes: ['me-1']
    }).e);
    if (options.append) this.e.appendChild(options.append);
    ul.classList.add('nested', 'list-group', 'ms-4', 'category_ul'); ////////////////////
    ul.setAttribute('id', `ul_${options.ul_id || random_id()}`);
    this.e.appendChild(span);
    this.e.appendChild(ul);
    this.e.addEventListener('mouseover', function () {
        if (dragging) this.classList.add('red');
    });
    this.e.addEventListener('mouseenter', function () {
        if (dragging) this.classList.add('red');
    });
    this.e.addEventListener('mouseleave', function () {
        if (dragging) this.classList.remove('red');
    });
};
function Div(options = {}) {
    this.e = document.createElement('div');
    if (options.classes)    options.classes.forEach(c => this.e.classList.add(c));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Form(options = {}) {
    this.e = document.createElement('form');
    if (options.classes) options.classes.forEach(c => this.e.classList.add(c));
    if (options.submit)  this.e.addEventListener('submit', options.submit);
    if (options.append)  options.append.forEach(a => this.e.appendChild(a));
};
function Link(options = {}) {
    this.e = document.createElement('a');
    this.e.classList.add('btn');
    if (options.classes) options.classes.forEach(c => this.e.classList.add(c));
    if        (options.type === 'edit') {
        this.e.classList.add('btn-success');
        this.e.innerHTML = _edit();
    } else if (options.type === 'move') {
        this.e.classList.add('btn-success');
        this.e.innerHTML = _move(options.type_attribute || '');
    } else {
        this.e.classList.add('btn-primary');
        this.e.innerHTML = _search();
    };
    if      (options.href)  this.e.setAttribute('href', options.href)
    else if (options.modal) {
        this.e.setAttribute('data-toggle', 'modal');
        this.e.setAttribute('data-target', `#mdl_${options.modal}`);
        if (options.source) this.e.setAttribute(`data-source`, options.source);
    };
    if (options.data)  this.e.setAttribute(`data-${options.data.field}`, options.data.value);
    if (options.small) this.e.classList.add('btn-sm');
    if (options.float) this.e.classList.add('float-end');
};
function Delete_Button(options = {}) {
    this.e = document.createElement('form');
    let btn = document.createElement('button');
    btn.classList.add('btn', 'btn-danger');
    btn.innerHTML = _delete();
    if (options.small)  btn.classList.add('btn-sm');
    if (options.float)  this.e.classList.add('float-end');
    if (options.inline) this.e.classList.add('inline-form');
    this.e.appendChild(btn);
    this.e.addEventListener("submit", function (event) {
        event.preventDefault();
        if (confirm(`Delete ${options.descriptor || `line`}?`)){
            sendData(this.e, 'DELETE', options.path, options.options || {reload: true});
        };
    });
};
function Checkbox(options = {}) {
    this.e = document.createElement('input');
    this.e.setAttribute('type', 'checkbox');
    this.e.classList.add('form-control');
    if (options.small)   this.e.classList.add('form-control-sm');
    if (options.float)   this.e.classList.add('w-50', 'float-end');
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Hidden(options = {}) {
    this.e = document.createElement('input');
    this.e.setAttribute('type', 'hidden');
    if (options.classes)    options.classes.forEach(   e => this.e.classList.add(e));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Input(options = {}) {
    this.e = document.createElement('input');
    this.e.setAttribute('type', 'text');
    this.e.classList.add('form-control');
    if (options.small)      this.e.classList.add('form-control-sm');
    if (options.classes)    options.classes.forEach(e => this.e.classList.add(e));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Tab_Header(options = {}) { 
    this.e = document.createElement('li');
    let a  = document.createElement('a');
    this.e.classList.add('nav_item');
    a.classList.add('nav-link', 'btn', 'btn-lg', 'btn-info', 'm-2', 'w-100-px');
    a.setAttribute('id', `${options.id}-tab`);
    a.setAttribute('data-toggle', 'tab');
    a.setAttribute('href', `#${options.id}`);
    a.setAttribute('role', 'tab');
    a.setAttribute('aria-controls', `${options.id}`);
    a.setAttribute('aria-selected', 'true');
    a.innerText = options.text;
    this.e.appendChild(a);
};
function Tab_Body(options = {}) {
    this.e = document.createElement('div');
    this.e.classList.add('tab-pane', 'fade');
    this.e.setAttribute('id', `${options.id}`);
    this.e.setAttribute('role', 'tabpanel');
    this.e.setAttribute('aria-labelledby', `${options.id}-tab`);
};
function Button(options = {}) {
    this.e = document.createElement('button');
    this.e.classList.add('btn');
    this.e.setAttribute('type', 'button');
    if (options.classes) options.classes.forEach(c => this.e.classList.add(c));
    if (options.small) this.e.classList.add('btn-sm');
    if (options.float) this.e.classList.add('float-end');

    if (options.type === 'edit') {
        this.e.classList.add('btn-success');
        this.e.innerHTML = _edit();
    } else if (options.type === 'move') {
        this.e.classList.add('btn-success');
        this.e.innerHTML = _move(options.type_attribute || '');
    } else if (options.type === 'delete') {
        this.e.classList.add('btn-danger');
        this.e.innerHTML = _delete();
    } else {
        this.e.classList.add('btn-primary');
        this.e.innerHTML = _search();
    };

    if (options.modal) {
        this.e.setAttribute('data-toggle', 'modal');
        this.e.setAttribute('data-target', `#mdl_${options.modal}`);
    };
    if (options.source) {
        this.e.setAttribute('data-source', options.source);
    };
    if (options.data) this.e.setAttribute(`data-${options.data.field}`, options.data.value);
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Select(options = {}) {
    this.e = document.createElement('select');
    if (options.classes)    options.classes.forEach(e => this.e.classList.add(e))
    else this.e.classList.add('form-control');
    if (options.small)      this.e.classList.add('form-control-sm');
    if (options.options)    options.options.forEach(e => this.e.appendChild(new Option(e).e));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
    if (options.listener)   this.e.addEventListener(options.listener.event, options.listener.func);
};
function Option(options = {}) {
    this.e = document.createElement('option');
    let _text = '', pre_text = '';
    if (options.selected === true) {
        this.e.setAttribute('selected', true);
        if (options.star_default) {
            _text = '***';
            pre_text = '***'
        } else if (options.default === true) _text = ' (default)';
    };
    if (options.value) this.e.setAttribute('value', options.value)
    else               this.e.setAttribute('value', '');
    this.e.innerText = `${pre_text}${options.text || ''}${_text}`;
};
function Spinner(options = {}) {
    this.e = document.createElement('div');
    this.e.setAttribute('id', `spn_${options.id || random_id}`);
    this.e.classList.add('spinner-border', 'text-primary', 'hidden');
    this.e.setAttribute('role', 'status');
    this.e.innerHTML = '<span class="sr-only">Loading...</span>';
};
function Card(options = {}) {
    this.e       = document.createElement('div');
    let a        = document.createElement('a'),
        header   = document.createElement('div'),
        title    = document.createElement('h3'),
        body     = document.createElement('div'),
        subtitle = document.createElement('p');
    if (options.id) this.e.setAttribute('id', options.id);
    this.e.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3');
    a.setAttribute('href', options.href);
    a.classList.add('card', 'm-3', 'text-start');
    header.classList.add('card-header');
    title.classList.add('card-title');
    if (options.search.title === true) title.classList.add('search');
    title.innerText = options.title;
    header.appendChild(title);
    if (options.subtitle) {
        subtitle.classList.add('card-subtitle', 'text-muted', 'f-10');
        if (options.subtitle.id) subtitle.setAttribute('id', options.subtitle.id);
        subtitle.innerText = options.subtitle.text || ''
        header.appendChild(subtitle);
    };
    body.classList.add('card-body');
    if (options.body && options.body.id)   body.setAttribute('id', options.body.id);
    if (options.body && options.body.data) body.setAttribute(`data-${options.body.data.field}`, options.body.data.value);
    a.appendChild(header);
    a.appendChild(body);
    this.e.appendChild(a);
};
function Badge(options = {}) {
    this.e = document.createElement('span');
    this.e.classList.add('mx-1', `float-${options.float}`, 'badge', `bg-${options.colour}`);
    this.e.setAttribute('data-toggle',    'tooltip');
    this.e.setAttribute('data-placement', 'top');
    this.e.setAttribute('title', `${options.text} ${options.table}`);
    this.e.innerText = options.count;
};