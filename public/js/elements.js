function _check()        {return '<i class="fas fa-check"></i>'}
function _search()       {return '<i class="fas fa-search"></i>'}
function _edit()         {return '<i class="fas fa-pencil-alt"></i>'}
function _move(att = '') {return `<i class="fas fa-align-justify"${att}></i>`}
function _delete()       {return '<i class="fas fa-trash-alt"></i>'}
function random_id()     {return Math.floor(Math.random()*10000)};

class LI {
    constructor(options = {}) {
        this.e = document.createElement('li');
        if (options.classes) {
            options.classes.forEach(e => this.e.classList.add(e));
        };
    };
};
function List_Item(text, caret) {
    this.e = new LI({classes: ['list-group-item', 'text-start', 'p-4']}).e;
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
    this.e.appendChild(new Anchor(
        _move(` data-id="${options.li_id || ''}"`),
        {
            classes: ['btn', 'btn-sm', 'btn-primary', 'me-1'],
            data: [{field: 'id', value: options.li_id || ''}]
        }
    ).e);
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
function Anchor(innerHTML, options = {}) {
    this.e = document.createElement('a');
    if (options.classes)    options.classes   .forEach(c => this.e.classList.add(c));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
    if (options.data)       options.data      .forEach(d => this.e.setAttribute(`data-${d.field}`, d.value));
    this.e.innerHTML = innerHTML;
};
function Modal_Button(image, modal, data, small = true, options = {}) {
    this.e = new Anchor(
        image,
        {
            classes: ['btn', `btn-${options.colour || 'primary'}`].concat((small ? ['btn-sm'] : [])).concat(options.classes || []),
            attributes: [
                {field: 'data-bs-toggle', value: 'modal'},
                {field: 'data-bs-target', value: `#mdl_${modal}`}
            ],
            data: data
        }
    ).e;
};
function Link(href) {
    this.e = new Anchor(
        _search(),
        {
            classes: ['btn', 'btn-sm', 'btn-primary'],
            attributes: [{field: 'href', value: href}]
        }
    ).e;
};
function Delete_Button(options = {}) {
    const submit_action = function (event) {
            event.preventDefault();
            if (confirm(`Delete ${options.descriptor || `line`}?`)){
                sendData(this.e, 'DELETE', options.path, options.options || {reload: true});
            };
        };
    this.e = new Form({
        submit: submit_action
    }).e;

    this.e.appendChild(new Button({
        html: _delete(),
        classes: ['btn-danger'],
        ...(options.small ? {small: true} : {})
    }).e);
};
function Label(innerHTML, options = {}) {
    this.e = document.createElement('label');
    if (options.classes)    options.classes   .forEach(e => this.e.classList.add(e));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
    this.e.innerHTML = innerHTML;
};
function Checkbox(options = {}) {
    if (!options.id) options.id = random_id();
    this.e = new Span((options.float ? {float: true} : {})).e;
    
    this.e.appendChild(new Checkbox_Input({
        attributes: [{field: 'id', value: `chk_${options.id}`}].concat(options.attributes || []),
        classes:    ['btn-check'],
        ...(options.listener ? {listener: options.listener} : {})
    }).e);

    this.e.appendChild(new Label(
        _check(),
        {
            classes:    ['btn', 'btn-outline-success'].concat((options.small ? ['btn-sm'] : [])),
            attributes: [{field: 'for', value: `chk_${options.id}`}]
        }
    ).e);
};
function Radio(options = {}) {
    if (!options.id) options.id = random_id();
    this.e = document.createElement('span');
    if (options.float_start) this.e.classList.add('float-start', 'mb-1');
    if (options.float) this.e.classList.add('float-end');

    this.e.appendChild(new Radio_Input({
        attributes: [{field: 'id', value: `rad_${options.id}`}].concat(options.attributes || []),
        classes:    ['btn-check'].concat(options.classes || []),
        ...(options.listener ? {listener: options.listener} : {})
    }).e);

    this.e.appendChild(new Label(
        options.html || _check(),
        {
            classes: ['btn', 'btn-sm', `btn-outline-${options.colour || 'success'}`, 'me-1'],
            attributes: [
                {field: 'for', value: `rad_${options.id}`}
            ].concat((options.tip ? [
                {field: 'data-bs-toggle', value: 'tooltip'},
                {field: 'title',          value: options.tip}
            ] : []))
        }
    ).e);
};
function Radio_Input(options = {}) {
    this.e = new Input({
        classes: options.classes || [],
        attributes: [{field: 'type', value: 'radio'}].concat(options.attributes || []),
        ...(options.listener ? {listener: options.listener} : {})
    }).e;
};
function Checkbox_Input(options = {}) {
    this.e = new Input({
        classes: options.classes || [],
        attributes: [{field: 'type', value: 'checkbox'}].concat(options.attributes || []),
        ...(options.listener ? {listener: options.listener} : {})
    }).e;
};
function Hidden_Input(options = {}) {
    this.e = new Input({
        classes: options.classes || [],
        attributes: [{field: 'type', value: 'hidden'}].concat(options.attributes || [])
    }).e;
};
function Number_Input(options = {}) {
    this.e = new Input({
        classes:    ['form-control', 'form-control-sm'].concat(options.classes    || []),
        attributes: [{field: 'type', value: 'number'}] .concat(options.attributes || []),
        ...(options.listener ? {listener: options.listener} : {})
    }).e;
};
function Text_Input(options = {}) {
    this.e = new Input({
        classes:    ['form-control', 'form-control-sm'].concat(options.classes    || []),
        attributes: [{field: 'type', value: 'text'}]   .concat(options.attributes || []),
        ...(options.listener ? {listener: options.listener} : {})
    }).e;
};
function Input(options = {}) {
    this.e = document.createElement('input');
    if (options.classes)    options.classes   .forEach(e => this.e.classList.add(e));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
    if (options.listener)   this.e.addEventListener(options.listener.event, options.listener.func);
    this.e.setAttribute('autocomplete', 'off');
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
    if (!options.large)     this.e.classList.add('form-select-sm');
    if (options.classes)    options.classes.forEach(e => this.e.classList.add(e));
    if (options.options)    options.options.forEach(e => {if (e) this.e.appendChild(new Option(e).e)});
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
    if (options.listener)   this.e.addEventListener(options.listener.event, options.listener.func);
};
function Option(options = {}) {
    this.e = document.createElement('option');
    let post_text = '';
    let pre_text = '';
    if (options.selected === true) {
        this.e.setAttribute('selected', true);
        if (options.star_default) {
            post_text = '***';
            pre_text = '***'
        } else if (options.default === true) post_text = ' (default)';
    };
    if (options.value) this.e.setAttribute('value', options.value)
    else               this.e.setAttribute('value', '');
    
    if (options.disabled) this.e.setAttribute('disabled', true);
    this.e.innerText = `${pre_text}${options.text || ''}${post_text}`;
};
function Spinner(id = null) {
    this.e = document.createElement('div');
    this.e.setAttribute('id', `spn_${id || random_id}`);
    this.e.classList.add('spinner-border', 'spinner-border-sm', 'text-primary');
    this.e.setAttribute('role', 'status');
    this.e.innerHTML = '<span class="sr-only">Loading...</span>';
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
function Page_Number(options = {}) {
    this.e = new LI({classes: ['page-item']}).e;
    if (options.selected) this.e.classList.add('active');
    let _btn = document.createElement('button');
    _btn.classList.add('page-link');
    this.e.setAttribute('data-value', options.text);
    _btn.innerText = Number(options.text) + 1;
    if (options.listener) _btn.addEventListener('click', options.listener);
    this.e.appendChild(_btn);
};
function Collapse(id) {
    this.e = document.createElement('div');
    this.e.classList.add('collapse');
    this.e.setAttribute('id', id);
};
function Collapse_A(id) {
    this.e = document.createElement('p');
    this.e.appendChild(new Anchor(
        'Issues',
        {
            data: [{field: 'bs-toggle', value: 'collapse'}],
            attributes: [
                {field: 'href',          value: `#${id}`},
                {field: 'role',          value: 'button'},
                {field: 'aria-expanded', value: 'false'},
                {field: 'aria-controls', value: id}
            ]
        }
    ).e);
};
function Link_Section(title) {
    this.e = document.createElement('section');
    this.e.classList.add('container', 'bordered', 'mb-2');

    let a = document.createElement('a');
    a.classList.add('my-3');
    a.setAttribute('data-bs-toggle', 'collapse');
    a.setAttribute('href', `#collapse${title}`);
    a.setAttribute('role', 'button');
    a.setAttribute('aria-expanded', 'false');
    a.setAttribute('aria-controls', `collapse${title}`);
    a.innerText = title;
    this.e.appendChild(a);

    let div = document.createElement('div');
    div.classList.add('collapse', 'show', 'mb-3', 'menu', 'row'); //menu and row here or in sub div?
    div.setAttribute('id', `collapse${title}`);
    // let card = document.createElement('div');
    // card.classList.add('card', 'card-body');
    // card.setAttribute('id', `row${title}`);
    
    // div.appendChild(card);
    this.e.appendChild(div);
};