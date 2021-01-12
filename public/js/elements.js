function _check()  {return '<i class="fas fa-check"></i>'}
function _search() {return '<i class="fas fa-search"></i>'}
function _globe()  {return '<i class="fas fa-globe-europe"></i>'}
function _edit()   {return '<i class="fas fa-pencil-alt"></i>'}//
function _save()   {return '<i class="fas fa-save"></i>'}
function _copy()   {return '<i class="fas fa-clipboard"></i>'}
function _delete() {return '<i class="fas fa-trash-alt"></i>'}
function random_id() {
    return Math.floor(Math.random()*10000)
};
function yesno(boolean) {
    if (boolean === 1 || boolean === true) return 'Yes'
    else return 'No'
};
function set_breadcrumb(options = {}) {
    let breadcrumb = document.querySelector('#breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerText = options.text || '';
        breadcrumb.setAttribute('href', options.href || '');
    };
};
function enable_button(id) {
    let button = document.querySelector(`#btn_${id}`);
    if (button) button.removeAttribute('disabled');
};
function disable_button(id) {
    let button = document.querySelector(`#btn_${id}`);
    if (button) button.setAttribute('disabled', true);
};
function set_count(options = {}) {
    let _count = document.querySelector(`#${options.id}_count`);
    if (_count) _count.innerText = options.count || '0';
};
function add_cell(row, options = {}) {
    let cell = row.insertCell();
    if (options.sort)      cell.setAttribute('data-sort', options.sort);
    if (options.text)      cell.innerText = options.text || '';
    else if (options.html) cell.innerHTML = options.html || '';
    if (options.classes)   options.classes.forEach(e => cell.classList.add(e));
    if (options.append)    cell.appendChild(options.append);
    if (options.id)        cell.setAttribute('id', options.id);
    if (options.data)      cell.setAttribute(`data-${options.data.field}`, options.data.value)
    if (options.ellipsis)  cell.classList.add('ellipsis1');
};
function show(id) {
    let element = document.querySelector(`#${id}`);
    if (element) element.classList.remove('hidden');
};
function hide(id) {
    let element = document.querySelector(`#${id}`);
    if (element) element.classList.add('hidden');
};
function set_innerText(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element) element.innerText = options.text || '';
};
function set_attribute(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element) element.setAttribute(options.attribute || '', options.value || '');
};
function remove_attribute(options = {}) {
    let element = document.querySelector(`#${options.id}`);
    if (element && options.attribute) element.removeAttribute(options.attribute);
};
function List_Item(options = {}) {
    this.e = document.createElement('li');
    this.e.classList.add('list-group-item', 'text-left', 'p-4');
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
    ul.setAttribute('id', `ul_${options.text}`)
    this.e.appendChild(ul);
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
    if (options.type === 'edit') {
        this.e.classList.add('btn-success');
        this.e.innerHTML = _edit();
    } else {
        this.e.classList.add('btn-primary');
        this.e.innerHTML = _search();
    };
    if      (options.href)  this.e.setAttribute('href', options.href)
    else if (options.modal) {
        this.e.setAttribute('data-toggle', 'modal');
        this.e.setAttribute('data-target', `#mdl_${options.modal}`);
        if (options.source) this.e.setAttribute(`data-source`, options.source);
        if (options.data)   this.e.setAttribute(`data-${options.data.field}`, options.data.value);
    };
    if (options.small) this.e.classList.add('btn-sm');
    if (options.float) this.e.classList.add('float-right');
};
function Delete_Button (options = {}) {
    this.e = document.createElement('form');
    let btn = document.createElement('button');
    btn.classList.add('btn', 'btn-danger');
    btn.innerHTML = _delete();
    if (options.small)  btn.classList.add('btn-sm');
    if (options.float)  this.e.classList.add('float-right');
    this.e.appendChild(btn);
    this.e.addEventListener("submit", function (event) {
        event.preventDefault();
        if (confirm(`Delete ${options.descriptor || `line`}?`)){
            sendData(this.e, 'DELETE', options.path, options.options || {reload: true});
        };
    });
};
function Checkbox (options = {}) {
    this.e = document.createElement('input');
    this.e.setAttribute('type', 'checkbox');
    this.e.classList.add('form-control');
    if (options.classes) options.classes.forEach(e => this.e.classList.add(e));
    if (options.small)   this.e.classList.add('form-control-sm');
    if (options.float)   this.e.classList.add('w-50', 'float-right');

    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));

    if (options.onChange)    this.e.addEventListener('change', function (event) {options.onChange()});
    if (options.keyUp)       this.e.addEventListener('keyup',  function (event) {options.keyUp()});
};
function Hidden (options = {}) {
    this.e = document.createElement('input');
    this.e.setAttribute('type', 'hidden');
    if (options.classes)    options.classes.forEach(   e => this.e.classList.add(e));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Input (options = {}) {
    this.e = document.createElement('input');
    this.e.setAttribute('type', 'text');
    this.e.classList.add('form-control');
    if (options.small) this.e.classList.add('form-control-sm');
    if (options.attributes)  options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Tab_Header (options = {}) { 
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
function Tab_Body (options = {}) {
    this.e = document.createElement('div');
    this.e.classList.add('tab-pane', 'fade');
    this.e.setAttribute('id', `${options.id}`);
    this.e.setAttribute('role', 'tabpanel');
    this.e.setAttribute('aria-labelledby', `${options.id}-tab`);
};
function Button (options = {}) {
    this.e = document.createElement('button');
    this.e.classList.add('btn');
    if      (options.small === true) this.e.classList.add('btn-sm');//
    if      (options.float === true) this.e.classList.add('float-right');//
    if      (options.type)           this.e.classList.add(`btn-${options.type}`)//
    else                             this.e.classList.add('btn-primary');
    if      (options.classes)        options.classes.forEach(e => this.e.classList.add(e));//
    if      (options.click)          this.e.addEventListener('click', options.click);//
    if      (options.text)           this.e.innerText = options.text//
    else if (options.html)           this.e.innerHTML = options.html;//
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
};
function Select (options = {}) {
    this.e = document.createElement('select');
    if (options.classes)    options.classes.forEach(e => this.e.classList.add(e))
    else this.e.classList.add('form-control');
    if (options.small)      this.e.classList.add('form-control-sm');
    if (options.options)    options.options.forEach(e => this.e.appendChild(new Option(e).e));
    if (options.attributes) options.attributes.forEach(a => this.e.setAttribute(a.field, a.value));
    if (options.listener)   this.e.addEventListener(options.listener.event, options.listener.func);
};
function Option (options = {}) {
    this.e = document.createElement('option');
    let _text = '', pre_text = '';
    if (options.selected === true) {
        this.e.setAttribute('selected', true);
        if (options.star_default) {
            _text = '***';
            pre_text = '***'
        } else if (options.default === true) _text = ' (default)';
    };
    if (options.value) this.e.setAttribute('value', options.value);
    this.e.innerText = `${pre_text}${options.text || ''}${_text}`;
};
function Card (options = {}) {
    this.e = document.createElement('div');
    let _a        = document.createElement('a'),
        _header   = document.createElement('div'),
        _title    = document.createElement('h3'),
        _body     = document.createElement('div'),
        _body_p   = document.createElement('p');
    if (options.search) this.e.setAttribute('data-search', options.search);
    this.e.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3', 'card_div');
    if (options.id) this.e.setAttribute('id', options.id);
    _a.setAttribute('href', options.href);
    _a.classList.add('card', 'm-3', 'text-left');
    _header.classList.add('card-header');
    _title.classList.add('card-title');
    if (options.search_title) _title.classList.add('search');
    _title.innerText = options.title;
    _header.appendChild(_title);
    if (options.subtitle) {
        let _subtitle = document.createElement('p');
        _subtitle.innerText = options.subtitle;
        _subtitle.classList.add('card-subtitle', 'text-muted');
        _header.appendChild(_subtitle);
    };
    _body.classList.add('card-body');
    _body_p.classList.add('text-left', 'f-10');
    if (options.search_body) _body_p.classList.add('search');
    if (options.body_ellipsis) _body_p.classList.add('ellipsis1');
    _body_p.innerHTML = options.body;
    _body.appendChild(_body_p);
    _a.appendChild(_header);
    _a.appendChild(_body);
    this.e.appendChild(_a);
};
function Spinner (options = {}) {
    this.e = document.createElement('div');
    this.e.setAttribute('id', `spn_${options.id || random_id}`);
    this.e.classList.add('spinner-border', 'text-primary', 'hidden');
    this.e.setAttribute('role', 'status');
    this.e.innerHTML = '<span class="sr-only">Loading...</span>';
};
function Input_Group (options = {}) {
    this.e = document.createElement('div')
    let prepend = document.createElement('div'),
        title   = document.createElement('span');
    this.e.classList.add('input-group', 'mb-1');
    prepend.classList.add('input-group-prepend', 'w-30');
    title.classList.add('input-group-text', 'w-100');
    title.innerText = options.title || '';
    prepend.appendChild(title);
    this.e.appendChild(prepend);
    if (options.text) {
        let text = document.createElement('p');
        text.classList.add('form-control');
        text.innerText = options.text || '';
        this.e.appendChild(text);
    } else if (options.append) {
        this.e.appendChild(options.append);
    };
    if (options.id) this.e.setAttribute('id', options.id)
    if (options.link) {
        let append = document.createElement('div'),
            link   = document.createElement('a');
        append.classList.add('input-group-append');
        link.classList.add('btn', 'btn-primary');
        link.setAttribute('href', options.link);
        link.innerHTML = '<i class="fas fa-search"></i>';
        append.appendChild(link);
        this.e.appendChild(append);
    };
};
function Modal (options = {}) {
    this.e = document.createElement('div');
    let mdl_dialog  = document.createElement('div'),
        mdl_content = document.createElement('div'),
        mdl_header  = document.createElement('div'),
        mdl_title   = document.createElement('h5'),
        mdl_body    = document.createElement('div'),
        mdl_footer  = document.createElement('div'),
        mdl_close   = document.createElement('button');
    this.e.setAttribute('id', `mdl_${options.id}`);
    this.e.setAttribute('tabindex', '-1');
    this.e.setAttribute('aria-labelledby', `mdl_${options.id}_title`);
    this.e.setAttribute('aria-hidden', 'true');
    this.e.classList.add('modal', 'fade');
    if (options.static === true) this.e.setAttribute('data-backdrop', 'static');
    mdl_dialog.classList.add('modal-dialog');
    mdl_content.classList.add('modal-content');
    mdl_header.classList.add('modal-header');
    mdl_header.setAttribute('id', `mdl_${options.id}_header`);
    mdl_title.classList.add('modal-title');
    if (options.title) mdl_title.innerText = options.title;
    mdl_title.setAttribute('id', `mdl_${options.id}_title`);
    mdl_header.appendChild(mdl_title);
    mdl_body.setAttribute('id', `mdl_${options.id}_body`)
    mdl_body.classList.add('modal-body');
    if (options.tabs === true) {
        let nav        = document.createElement('nav'),
            nav_tabs   = document.createElement('div'),
            nav_bodies = document.createElement('div'),
            nav_body_1 = new Tab_Pane({id:{tab:`mdl_line_${options.id}_tab_1`,body:`mdl_line_${options.id}_body_1`},active:true}).e,
            nav_body_2 = new Tab_Pane({id:{tab:`mdl_line_${options.id}_tab_2`,body:`mdl_line_${options.id}_body_2`}}).e,
            nav_body_3 = new Tab_Pane({id:{tab:`mdl_line_${options.id}_tab_3`,body:`mdl_line_${options.id}_body_3`}}).e;
        nav_tabs.classList.add('nav', 'nav-tabs');
        nav_tabs.setAttribute('role', 'tablist');
        nav_tabs.appendChild(new Tab({id:{tab:`mdl_line_${options.id}_tab_1`,body: `mdl_line_${options.id}_body_1`},text: 'Item',active: true}).e);
        nav_tabs.appendChild(new Tab({id:{tab:`mdl_line_${options.id}_tab_2`,body: `mdl_line_${options.id}_body_2`},text: 'Dates'}).e);
        nav_tabs.appendChild(new Tab({id:{tab:`mdl_line_${options.id}_tab_3`,body: `mdl_line_${options.id}_body_3`},text: 'Notes'}).e);
        nav.appendChild(nav_tabs);
        nav_bodies.classList.add('tab-content');
        if (options.size) {
            nav_body_1.appendChild(new Input_Group({title: 'Item', text: options.size.item._description, link: `/stores/items/${options.size.item_id}`}).e);
            nav_body_1.appendChild(new Input_Group({title: 'Size', text: options.size._size, link: `/stores/sizes/${options.size_id}`}).e);
        };
        nav_body_3.appendChild(new Modal_Notes({id: `line_${options.id}`}).e);
        nav_bodies.appendChild(nav_body_1);
        nav_bodies.appendChild(nav_body_2);
        nav_bodies.appendChild(nav_body_3);
        nav.appendChild(nav_bodies);
        mdl_body.appendChild(nav);
        let select = document.querySelector(`#sel_system_modal_line_${options.id}`);
        if (select) select.addEventListener('change', function() {get_line_notes({id: line.line_id, table: options.table})});
    };
    mdl_footer.classList.add('modal-footer');
    mdl_close.setAttribute('type', 'button');
    mdl_close.setAttribute('data-dismiss', 'modal');
    mdl_close.classList.add('btn', 'btn-primary');
    mdl_close.innerText = 'Close';
    mdl_footer.appendChild(mdl_close);
    mdl_content.appendChild(mdl_header);
    mdl_content.appendChild(mdl_body);
    mdl_content.appendChild(mdl_footer);
    mdl_dialog.appendChild(mdl_content);
    this.e.appendChild(mdl_dialog);
};
function Modal_Link (options = {}) {
    this.e = document.createElement('button');
    this.e.setAttribute('type', 'button');
    this.e.setAttribute('data-toggle', 'modal');
    this.e.setAttribute('data-target', `mdl_${options.id}`);
    this.e.classList.add('btn', 'btn-sm', 'btn-primary');
    this.e.innerHTML = '<i class="fas fa-search"></i>';
    this.e.addEventListener('click', function () {$(`#mdl_${options.id}`).modal('show')});
};
function Modal_Notes (options = {}) {
    this.e = document.createElement('div');
    this.e.appendChild(
        new Input_Group({
            title: 'System Notes',
            append: new Select({
                attributes: [
                    {field: 'id', value: `mdl_${options.id}_sel_system`}
                ],
                options: [
                    {value: '',          text: 'Include', selected: true},
                    {value: '_system=0', text: 'Exclude'},
                    {value: '_system=1', text: 'Only'}
                ]
            }).e
        }).e
    );
    let table = document.createElement('table'),
        head  = document.createElement('thead'),
        body  = document.createElement('tbody');
    table.classList.add('table', 'table-sm', 'table-hover');
    head.classList.add('thead-dark');
    head.appendChild(new TH({width: '30', text: 'Date'}).e);
    head.appendChild(new TH({width: '40', text: 'Note'}).e);
    head.appendChild(new TH({width: '30', text: 'User'}).e);
    table.appendChild(head);
    body.setAttribute('id', `mdl_${options.id}_note_lines`);
    table.appendChild(body);
    this.e.appendChild(table);
};
function A (options = {}) {
    this.e = document.createElement('a');
    if      (options.classes) options.classes.forEach(e => this.e.classList.add(e));
    if      (options.href)   this.e.setAttribute('href', options.href)
    if      (options.text)   this.e.innerText   = options.text
    else if (options.html)   this.e.innerHTML   = options.html
    else if (options.append) this.e.appendChild(options.append);
};
function P (options = {}) {
    this.e = document.createElement('p');
    if      (options.text)   this.e.innerText   = options.text
    else if (options.html)   this.e.innerHTML   = options.html
    else if (options.append) this.e.appendChild(options.append);
};
function TH (options = {}) {
    this.e = document.createElement('th');
    if (options.width) this.e.classList.add(`w-${options.width}`);
    if      (options.text) this.e.innerText = options.text
    else if (options.html) this.e.innerHTML = options.html;
};
function Tab (options = {}) {
    this.e = document.createElement('a');
    this.e.classList.add('nav-link');
    if (options.active === true) {
        this.e.classList.add('active');
        this.e.setAttribute('aria-selected', 'true');
    } else {
        this.e.setAttribute('aria-selected', 'false');
    };
    this.e.setAttribute('id', options.id.tab);
    this.e.setAttribute('data-toggle', 'tab');
    this.e.setAttribute('href', `#${options.id.body}`);
    this.e.setAttribute('role','tab');
    this.e.setAttribute('aria-controls', options.id.body);
    this.e.innerText = options.text;
};
function Tab_Pane (options = {}) {
    this.e = document.createElement('div');
    this.e.classList.add('tab-pane', 'fade');
    if (options.active === true) this.e.classList.add('show', 'active');
    this.e.setAttribute('id', options.id.body);
    this.e.setAttribute('role', 'tabpanel');
    this.e.setAttribute('aria-labelledby', options.id.tab);
};
function print_user (user) {
    if (user) return `${user.rank._rank } ${user.full_name}`
    else return '';
};
function print_date (date, time = false) {
    if (date) {
        let str = new Date(date).toDateString();
        if (time) str += ` ${new Date(date).toLocaleTimeString()}`;
        return str
    } else return '';
};
function print_nsn (nsn) {
    if (nsn && nsn.group && nsn.classification && nsn.country) {
        return `${String(nsn.group._code).padStart(2, '0')}${String(nsn.classification._code).padStart(2, '0')}-${String(nsn.country._code).padStart(2, '0')}-${nsn._item_number}`
    } else return '';
};