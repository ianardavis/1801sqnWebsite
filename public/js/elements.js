function _check ()  {return '<i class="fas fa-check"></i>'}
function _search () {return '<i class="fas fa-search"></i>'}
function _globe ()  {return '<i class="fas fa-globe-europe"></i>'}
function _edit ()   {return '<i class="fas fa-pencil-alt"></i>'}
function _save ()   {return '<i class="fas fa-save"></i>'}
function _copy ()   {return '<i class="fas fa-clipboard"></i>'}
function _delete () {return '<i class="fas fa-trash-alt"></i>'}
function random_id () {
    return Math.floor(Math.random()*10000)
};
function yesno (boolean) {
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
function add_cell (row, options = {}) {
    let cell = row.insertCell();
    if (options.sort)      cell.dataset.sort = options.sort;
    if (options.text)      cell.innerText = options.text || '';
    else if (options.html) cell.innerHTML = options.html || '';
    if (options.classes)   options.classes.forEach(e => cell.classList.add(e));
    if (options.append)    cell.appendChild(options.append);
    if (options.id)        cell.id = options.id;
    if (options.ellipsis)  cell.classList.add('ellipsis1');
};
function List_Item (options = {}) {
    this.e = document.createElement('li');
    this.e.classList.add('list-group-item', 'text-left', 'p-4');
    this.e.appendChild(new Input({id: `permission_${options.text}`, type: 'checkbox', name: `permissions[]`, value: options.text, small: true, float_right: true}).e);
    let span = document.createElement('span');
    span.innerText = options.text.replaceAll('_', ' ') || '';
    if (options.caret === true) {
        let ul   = document.createElement('ul');
        span.classList.add('caret');
        this.e.appendChild(span);
        ul.classList.add('nested', 'list-group');
        ul.setAttribute('id', `ul_${options.text}`)
        this.e.appendChild(ul);
    } else this.e.appendChild(span);
};
function Div (options = {}) {
    this.e = document.createElement('div');
    if (options.classes) options.classes.forEach(c => this.e.classList.add(c));
};
function Form (options = {}) {
    this.e = document.createElement('form');
    if (options.id)      this.e.setAttribute('id', options.id);
    if (options.classes) options.classes.forEach(c => this.e.classList.add(c));
    if (options.submit)  this.e.addEventListener('submit', options.submit);
    if (options.append)  options.append.forEach(a => this.e.appendChild(a));
};
function Link (options = {}) {
    this.e = document.createElement('a');
    this.e.classList.add('btn');
    if (options.type === 'edit') {
        this.e.classList.add('btn-success');
        this.e.innerHTML = _edit();
    } else if (options.type === 'copy') {
        this.e.classList.add('btn-info');
        this.e.innerHTML = _copy();
    } else {
        this.e.classList.add('btn-primary');
        this.e.innerHTML = _search();
    };
    if      (options.href)  this.e.setAttribute('href', options.href)
    else if (options.modal) {
        this.e.setAttribute('data-toggle', 'modal');
        this.e.setAttribute('data-target', `#mdl_${options.modal}`);
    };
    if (options.id)     this.e.setAttribute('id', options.id);
    if (options.margin) this.e.classList.add('m-1');
    if (options.small)  this.e.classList.add('btn-sm');
    if (options.float)  this.e.classList.add('float-right');
};
function Delete_Button (options = {}) {
    this.e = document.createElement('form');
    let btn = document.createElement('button');
    btn.classList.add('btn', 'btn-danger');
    btn.innerHTML = _delete();
    if (options.margin) btn.classList.add('m-1');
    if (options.small)  btn.classList.add('btn-sm');
    if (options.float)  this.e.classList.add('float-right');
    this.e.appendChild(btn);
    this.e.addEventListener("submit", event => {
        event.preventDefault();
        if (confirm(`Delete ${options.descriptor || `line`}?`)){
            sendData(this.e, 'DELETE', options.path, options.options || {reload: true});
        };
    });
};
function Input (options = {}) {
    this.e = document.createElement('input');
    if (options.classes) {
        options.classes.forEach(e => this.e.classList.add(e))
    } else {
        if (!options.type || options.type !==  'hidden') this.e.classList.add('form-control');
    };
    this.e.setAttribute('type', options.type  || 'text');
    if (options.float_right) this.e.classList.add('w-50', 'float-right');
    if (options.type === 'number') {
        if (options.step)    this.e.setAttribute('step', options.step);
    };
    if (options.completeOff) this.e.setAttribute('autocomplete', 'off');
    if (options.name)        this.e.setAttribute('name', options.name);
    if (options.small)       this.e.classList.add('form-control-sm');
    if      (options.value)  this.e.setAttribute('value', options.value);
    else if (options.html)   this.e.innerHTML = options.html;
    if (options.min)         this.e.setAttribute('min', options.min);
    if (options.minlength)   this.e.setAttribute('minlength', options.minlength);
    if (options.maxlength)   this.e.setAttribute('maxlength', options.maxlength);
    if (options.id)          this.e.setAttribute('id', options.id);
    if (options.placeholder) this.e.setAttribute('placeholder', options.placeholder);
    if (options.required)    this.e.setAttribute('required', true);
    if (options.disabled)    this.e.setAttribute('disabled', true);
    if (options.onChange)    this.e.addEventListener('change', function (event) {options.onChange()});
    if (options.keyUp)       this.e.addEventListener('keyup', function (event) {options.keyUp()});
};
function Tab_Header (options ={}) {
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
    if (options.classes)   options.classes.forEach(e => this.e.classList.add(e));
    if (options.type)              this.e.classList.add(`btn-${options.type}`);
    if (options.confirm === true)  this.e.classList.add('confirm');
    else                           this.e.classList.add('btn-primary');
    if (options.small === true)    this.e.classList.add('btn-sm');
    if      (options.text)         this.e.innerText = options.text
    else if (options.html)         this.e.innerHTML = options.html;
    if (options.id)                this.e.setAttribute('id', options.id);
    if (options.disabled === true) this.e.setAttribute('disabled', true);
    if (options.click)             this.e.addEventListener('click', options.click);
};
function Select (options = {}) {
    this.e = document.createElement('select');
    if (options.classes) {
        options.classes.forEach(e => this.e.classList.add(e))
    } else this.e.classList.add('form-control');
    if (options.name)     this.e.setAttribute('name', options.name);
    if (options.small)    this.e.classList.add('form-control-sm');
    if (options.required) this.e.required = true;
    if (options.id)       this.e.id = options.id;
    if (options.size)     this.e.setAttribute('size', options.size);
    if (options.options)  options.options.forEach(e => this.e.appendChild(new Option(e).e));
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
    this.e.value     = options.value || '';
    this.e.innerText = `${pre_text}${options.text || ''}${_text}`;
};
function Card (options = {}) {
    this.e = document.createElement('div');
    let _a        = document.createElement('a'),
        _header   = document.createElement('div'),
        _title    = document.createElement('h3'),
        _body     = document.createElement('div'),
        _body_p   = document.createElement('p');
    if (options.search) this.e.dataset.search = options.search;
    this.e.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3', 'card_div');
    if (options.id) this.e.id = options.id;
    _a.href = options.href;
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
function Toast (options = {}) {
    this.e = document.createElement('div');
    this.e.id = options.id || `toast_${random_id}`;
    this.e.setAttribute('role', 'alert');
    this.e.setAttribute('aria-live', 'assertive');
    this.e.setAttribute('aria-atomic', 'true');
    this.e.classList.add('toast', 'float-right');
    this.e.setAttribute('data-autohide', 'false');
    let header = document.createElement('div'),
        title  = document.createElement('strong'),
        close_button = document.createElement('button'),
        body   = document.createElement('div');
    header.classList.add('toast-header');
    title.innerText = options.title;
    title.classList.add('mr-auto')
    header.appendChild(title);
    close_button.setAttribute('type', 'button');
    close_button.classList.add('ml-2', 'mb-1', 'close');
    close_button.setAttribute('data-dismiss', 'toast');
    close_button.setAttribute('aria-label', 'Close');
    close_button.innerHTML = '<span aria-hidden="true">&times;</span>';
    header.appendChild(close_button);
    this.e.appendChild(header);
    body.classList.add('toast-body', 'toast-warn');
    body.innerText = options.text || '';
    this.e.appendChild(body);
};
function Column (options = {}) {
    this.e = document.createElement('th');
    this.e.setAttribute('id', options.id || `th_${random_id}`);
    if (options.classes) options.classes.forEach(e => this.e.classList.add(e));
    if (options.onclick) this.e.setAttribute('onclick', options.onclick);
    if (options.html)    this.e.innerHTML = options.html
    else this.e.innerText = options.text || '';
};
function Spinner (options = {}) {
    this.e = document.createElement('div');
    this.e.id = `spn_${options.id || random_id}`;
    this.e.classList.add('spinner-border', 'text-primary', 'hidden');
    this.e.setAttribute('role', 'status');
    this.e.innerHTML = '<span class="sr-only">Loading...</span>';
};
function Notification (options = {}) {
    this.e = document.createElement('li');
    this.e.classList.add('alert', 'my-1', 'p-1', 'notification');
    if (options.urgency === 1) this.e.classList.add('alert-success')
    else if (options.urgency === 2) this.e.classList.add('alert-warning')
    else if (options.urgency === 3) this.e.classList.add('alert-danger')
    else this.e.classList.add('alert-info')
    this.e.setAttribute('role', 'alert', 'my-1', 'p-1', 'notification');
    let heading = document.createElement('h4'),
        date = document.createElement('span'),
        body = document.createElement('p');
    heading.classList.add('alert-heading');
    heading.innerText = options.title || '';
    date.classList.add('float-right', 'f-10');
    date.innerText = options.date || '';
    heading.appendChild(date);
    body.classList.add('f-09', 'm-0');
    body.innerText = options.text || '';
    this.e.appendChild(heading);
    this.e.appendChild(body);
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
function Textarea (options = {}) {
    this.e = document.createElement('textarea');
    this.e.classList.add('form-control');
    if (options.disabled) this.e.setAttribute('disabled', true)
    if (options.text)     this.e.innerText = options.text;
    if (options.id)       this.e.setAttribute('id', options.id);
}
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
                id: `sel_system_modal_${options.id}`,
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
        col1  = document.createElement('th'),
        col2  = document.createElement('th'),
        col3  = document.createElement('th'),
        body  = document.createElement('tbody');
    table.classList.add('table', 'table-sm', 'table-hover');
    head.classList.add('thead-dark');
    col1.classList.add('w-30');
    col1.innerText = 'Date';
    head.appendChild(col1);
    col2.classList.add('w-40');
    col2.innerText = 'Note';
    head.appendChild(col2);
    col3.classList.add('w-30');
    col3.innerText = 'User';
    head.appendChild(col3);
    table.appendChild(head);
    body.setAttribute('id', `note_lines_mdl_${options.id}`);
    table.appendChild(body);
    this.e.appendChild(table);
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
function Password_Requirements () {
    this.e = document.createElement('div');
    let p  = document.createElement('p'),
        ul = document.createElement('ul')
    p.innerText = 'Password MUST NOT be the current password\nPassword MUST include:'
    p.classList.add('my-1');
    this.e.appendChild(p);
    ul.classList.add('list-group', 'mb-3');
    [
        {text: 'At Least 8 characters',                       id: 'length'},
        {text: 'A number',                                    id: 'number'},
        {text: 'An upper case letter',                        id: 'upper'},
        {text: 'A lower case letter',                         id: 'lower'},
        {text: 'A special character ( ! ? @ # $ £ % ^ & * )', id: 'special'},
        {text: 'Entered and confirmed passwords must match',  id: 'match'}
    ].forEach(e => {
        let li   = document.createElement('li'),
            span = document.createElement('span');
        li.classList.add('list-group-item', 'd-flex', 'p-1', 'justify-content-between', 'align-items-center');
        li.innerText = e.text;
        span.setAttribute('id', `pwd_${e.id}`);
        span.classList.add('badge','badge-danger','badge-pill');
        span.innerHTML = '<i class="fas fa-times"></i>';
        li.appendChild(span);
        ul.appendChild(li);
    });
    this.e.appendChild(ul);
};