function _check()  {return '<i class="fas fa-check"></i>'}
function _search() {return '<i class="fas fa-search"></i>'}
function _globe()  {return '<i class="fas fa-globe-europe"></i>'}
function _edit()   {return '<i class="fas fa-pencil-alt"></i>'}//
function _save()   {return '<i class="fas fa-save"></i>'}
function _move(attribute = '') {return `<i class="fas fa-align-justify"${attribute}></i>`}
function _copy()   {return '<i class="fas fa-clipboard"></i>'}
function _delete() {return '<i class="fas fa-trash-alt"></i>'}
function random_id() {return Math.floor(Math.random()*10000)};

function List_Item(text, caret) {
    this.e = document.createElement('li');
    this.e.classList.add('list-group-item', 'text-start', 'p-4');
    this.e.appendChild(
        new Checkbox({
            id: text,
            attributes: [
                {field: 'name',  value: 'permissions[]'},
                {field: 'value', value: text}
            ],
            small: true,
            float: true
        }).e
    );
    this.e.appendChild(new Span({
        innerText: text.replaceAll('_', ' ') || '',
        classes: (caret ? ['caret'] : [])
    }).e);
    this.e.appendChild(new UL({
        classes: ['nested', 'list-group'],
        attributes: [{field: 'id', value: `ul_${text}`}]
    }).e);
};
function Category_LI(options = {}) {
    this.e = document.createElement('li');
    this.e.setAttribute('data-id', options.li_id || random_id);
    this.e.classList.add('list-group-item', 'text-start', 'category_li', 'my-1');
    this.e.appendChild(new Link({
        type: 'move',
        type_attribute: `data-id="${options.li_id || ''}"`,
        data: [{field: 'id', value: options.li_id || ''}],
        classes: ['me-1']
    }).e);
    if (options.append) this.e.appendChild(options.append);
    this.e.appendChild(new Span({
        innerText: options.text || '',
        classes:   ['caret', 'ms-3'],
        attributes: [{field: 'id', value: `caret_${options.li_id}`}]
    }).e);
    this.e.appendChild(new UL({
        classes: ['nested', 'list-group', 'ms-4', 'category_ul'],
        attributes: [{field: 'id', value: `ul_${options.ul_id || random_id()}`}]
    }).e);
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
function UL(options = {}) {
    this.e = document.createElement('ul');
    if (options.classes)    options.classes   .forEach(c => this.e.classList.add(c));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
}
function Div(options = {}) {
    this.e = document.createElement('div');
    if (options.classes)    options.classes   .forEach(c => this.e.classList.add(c));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
    if (options.data)       options.data      .forEach(e => this.e.setAttribute(`data-${e.field}`, e.value));
};
function Span(options = {}) {
    this.e = document.createElement('span');
    if (options.innerText)  this.e.innerText = options.innerText;
    if (options.classes)    options.classes   .forEach(c => this.e.classList.add(c));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
    if (options.data)       options.data      .forEach(e => this.e.setAttribute(`data-${e.field}`, e.value));
    if (options.float)                                      this.e.classList.add('float-end');
};
function Form(options = {}) {
    this.e = document.createElement('form');
    if (options.submit)     this.e.addEventListener('submit', options.submit);
    if (options.classes)    options.classes   .forEach(c => this.e.classList.add(c));
    if (options.append)     options.append    .forEach(a => this.e.appendChild(a));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Link(options = {}) {
    this.e = document.createElement('a');
    this.e.classList.add('btn');
    if (!options.large) this.e.classList.add('btn-sm');
    if (options.classes) options.classes.forEach(c => this.e.classList.add(c));

    if      (options.type === 'edit') this.e.innerHTML = _edit()
    else if (options.type === 'move') this.e.innerHTML = _move(options.type_attribute || '')
    else                              this.e.innerHTML = _search();

    if (options.type === 'edit' || options.type === 'move') this.e.classList.add('btn-success');
    else                                                    this.e.classList.add('btn-primary');

    if      (options.href) this.e.setAttribute('href', options.href)
    else if (options.modal) {
        this.e.setAttribute('data-bs-toggle', 'modal');
        this.e.setAttribute('data-bs-target', `#mdl_${options.modal}`);
    };
    if (options.data) {
        options.data.forEach(e => this.e.setAttribute(`data-${e.field}`, e.value));
    };
};
function Delete_Button(options = {}) {
    this.e = document.createElement('form');
    let btn = document.createElement('button');
    btn.classList.add('btn', 'btn-danger');
    btn.innerHTML = _delete();
    if (options.small)  btn.classList.add('btn-sm');
    this.e.appendChild(btn);
    this.e.addEventListener("submit", function (event) {
        event.preventDefault();
        if (confirm(`Delete ${options.descriptor || `line`}?`)){
            sendData(this.e, 'DELETE', options.path, options.options || {reload: true});
        };
    });
};
function Checkbox(options = {}) {
    if (!options.id) options.id = random_id();
    this.e = document.createElement('span');
    let checkbox = document.createElement('input'),
        label    = document.createElement('label');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('autocomplete', 'off');
    checkbox.setAttribute('id', `chk_${options.id}`);
    checkbox.classList.add('btn-check');
    if (options.input_classes) options.input_classes.forEach(c => checkbox.classList.add(c));
    if (options.attributes)    options.attributes   .forEach(a => checkbox.setAttribute(a.field, a.value));
    label.classList.add('btn', 'btn-outline-success');
    label.setAttribute('for', `chk_${options.id}`);
    label.innerHTML = _check();
    if (options.small) label.classList.add('btn-sm');
    if (options.float) this.e.classList.add('float-end');
    this.e.appendChild(checkbox);
    this.e.appendChild(label);
};
function Radio(options = {}) {
    if (!options.id) options.id = random_id();
    this.e = document.createElement('span');
    if (options.float_start) this.e.classList.add('float-start');
    let radio = document.createElement('input'),
        label = document.createElement('label');
    radio.setAttribute('type', 'radio');
    radio.setAttribute('id', `rad_${options.id}`);
    radio.setAttribute('autocomplete', 'off');
    radio.classList.add('btn-check');
    if (options.classes)    options.classes.forEach(c => radio.classList.add(c));
    if (options.attributes) options.attributes.forEach(a => radio.setAttribute(a.field, a.value));
    label.classList.add('btn', `btn-outline-${options.colour || 'success'}`);
    label.setAttribute('for', `rad_${options.id}`);
    label.innerHTML = options.html || _check();
    if (options.small) label.classList.add('btn-sm');
    if (options.float) this.e.classList.add('float-end');
    if (options.listener) radio.addEventListener(options.listener.event, options.listener.func);
    this.e.appendChild(radio);
    this.e.appendChild(label);
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
    this.e.setAttribute('autocomplete', options.autocomplete || 'off')
    if (options.small)      this.e.classList.add('form-control-sm');
    if (options.classes)    options.classes.forEach(e => this.e.classList.add(e));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Tab_Header(id, text) { 
    this.e = document.createElement('li');
    let a  = document.createElement('a');
    this.e.classList.add('nav_item', 'pos_header');
    a.classList.add('nav-link');
    a.setAttribute('id', `${id}-tab`);
    a.setAttribute('data-bs-toggle', 'tab');
    a.setAttribute('href', `#${id}`);
    a.setAttribute('role', 'tab');
    a.setAttribute('aria-controls', `${id}`);
    a.setAttribute('aria-selected', 'true');
    a.innerText = text;
    this.e.appendChild(a);
};
function Tab_Body(id) {
    this.e = document.createElement('div');
    this.e.classList.add('tab-pane', 'fade', 'pos_page');
    this.e.setAttribute('id', `${id}`);
    this.e.setAttribute('role', 'tabpanel');
    this.e.setAttribute('aria-labelledby', `${id}-tab`);
};
function Button(options = {}) {
    this.e = document.createElement('button');
    this.e.classList.add('btn');
    if (!options.noType) this.e.setAttribute('type', 'button');
    if (options.small)   this.e.classList.add('btn-sm');
    if (options.float)   this.e.classList.add('float-end');
    if (options.classes) options.classes.forEach(c => this.e.classList.add(c));

    if      (options.text)              this.e.innerText = options.text
    else if (options.html)              this.e.innerHTML = options.html
    else if (options.type === 'edit')   this.e.innerHTML = _edit()
    else if (options.type === 'move')   this.e.innerHTML = _move(options.type_attribute || '')
    else if (options.type === 'delete') this.e.innerHTML = _delete()
    else                                this.e.innerHTML = _search();

    if      (options.colour)                                     this.e.classList.add(`btn-${options.colour}`)
    else if (options.type === 'edit' || options.type === 'move') this.e.classList.add('btn-success')
    else if (options.type === 'delete')                          this.e.classList.add('btn-danger')
    else                                                         this.e.classList.add('btn-primary');

    if (options.modal) {
        this.e.setAttribute('data-bs-toggle', 'modal');
        this.e.setAttribute('data-bs-target', `#mdl_${options.modal}`);
    };
    if (options.source)                                     this.e.setAttribute('data-source', options.source);
    if (options.data)       options.data      .forEach(e => this.e.setAttribute(`data-${e.field}`, e.value));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
    if (options.append)     options.append    .forEach(e => this.e.appendChild(e));
    if (options.onClick)    this.e.addEventListener('click', options.onClick);
};
function Select(options = {}) {
    this.e = document.createElement('select');
    this.e.classList.add('form-select');
    if (options.small)      this.e.classList.add('form-select-sm');
    if (options.classes)    options.classes.forEach(e => this.e.classList.add(e));
    if (options.options)    options.options.forEach(e => {if (e) this.e.appendChild(new Option(e).e)});
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
    this.e.classList.add('spinner-border', 'spinner-border-sm', 'text-primary');
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
    this.e.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3');
    if (options.href) a.setAttribute('href', options.href);
    a.classList.add('card', 'm-3', 'text-start');
    header.classList.add('card-header');
    if (options.head_100) header.classList.add('h-100-px');
    title.classList.add('card-title');
    if (options.search && options.search.title === true) title.classList.add('search');
    title.innerText = options.title;
    header.appendChild(title);
    if (options.subtitle) {
        subtitle.classList.add('card-subtitle', 'text-muted', 'f-10');
        if (options.subtitle.id) subtitle.setAttribute('id', options.subtitle.id);
        subtitle.innerText = options.subtitle.text || ''
        header.appendChild(subtitle);
    };
    body.classList.add('card-body');
    if (options.body && options.body.data) body.setAttribute(`data-${options.body.data.field}`, options.body.data.value);
    a.appendChild(header);
    a.appendChild(body);
    this.e.appendChild(a);
};
function Badge(options = {}) {
    this.e = document.createElement('span');
    this.e.classList.add('mx-1', `float-${options.float}`, 'badge', `bg-${options.colour}`);
    this.e.setAttribute('data-bs-toggle',    'tooltip');
    this.e.setAttribute('data-placement', 'top');
    this.e.setAttribute('title', `${options.text} ${options.table}`);
    this.e.innerText = options.count;
};
function Notification (options = {}) {
    this.e = document.createElement('li');
    this.e.classList.add('alert', 'my-1', 'p-1', 'notification');

    if      (options.urgency === 1) this.e.classList.add('alert-success')
    else if (options.urgency === 2) this.e.classList.add('alert-warning')
    else if (options.urgency === 3) this.e.classList.add('alert-danger')
    else                            this.e.classList.add('alert-info');

    this.e.setAttribute('role', 'alert', 'my-1', 'p-1', 'notification');
    let heading = document.createElement('h4'),
        body    = document.createElement('p');
    heading.classList.add('alert-heading');
    heading.innerText = options.title || '';
    heading.appendChild(new Span({
        classes: ['float-end', 'f-10'],
        innerText: options.date || ''
    }).e);
    body.classList.add('f-09', 'm-0');
    body.innerText = options.text || '';
    this.e.appendChild(heading);
    this.e.appendChild(body);
};
function TH(options = {}) {
    this.e = document.createElement('th');
    if      (options.text) this.e.innerText = options.text
    else if (options.html) this.e.innerHTML = options.html
    if (options.width) this.e.classList.add(`w-${options.width}`);
    if (options.sort)  {
        this.e.setAttribute('onclick',       `sortByRow(this, ${options.sort.func})`);
        this.e.setAttribute('data-sort_col', options.sort.col);
        this.e.appendChild(new Span({classes: ['sort_ind', 'float-end']}).e);
    };
};
function THEAD() {
    this.e = document.createElement('thead');
    this.e.classList.add('thead-dark');
};
function TBODY(id) {
    this.e = document.createElement('tbody');
    this.e.setAttribute('id', `tbl_${id}`);
}
function Table() {
    this.e = document.createElement('table');
    this.e.classList.add('table', 'table-sm', 'table-hover');
};
function H5(options = {}) {
    this.e = document.createElement('h5');
    if (options.text) this.e.innerText = options.text;
};
function P(options = {}) {
    this.e = document.createElement('p');
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};