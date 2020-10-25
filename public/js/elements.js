function _check ()  {return '<i class="fas fa-check"></i>'}
function _search () {return '<i class="fas fa-search"></i>'}
function _globe ()  {return '<i class="fas fa-globe-europe"></i>'}
function _edit ()   {return '<i class="fas fa-pencil-alt"></i>'}
function _save ()   {return '<i class="fas fa-save"></i>'}
function _copy ()   {return '<i class="fas fa-clipboard"></i>'}
function _delete () {return '<i class="fas fa-trash-alt"></i>'}
random_id = () => {
    return Math.floor(Math.random()*10000)
};
function Link (options = {}) {
    this.link      = document.createElement('a');
    this.link.href = options.href;
    this.link.classList.add('btn');
    if (options.type === 'edit') {
        this.link.classList.add('btn-success');
        this.link.innerHTML = _edit();
    } else if (options.type === 'copy') {
        this.link.classList.add('btn-info');
        this.link.innerHTML = _copy();
    } else {
        this.link.classList.add('btn-primary');
        this.link.innerHTML = _search();
    };
    if (options.margin) this.link.classList.add('m-1');
    if (options.small)  this.link.classList.add('btn-sm');
    if (options.float)  this.link.classList.add('float-right');
    if (options.id)     this.link.id = options.id;
};
function DeleteButton (options = {}) {
    this.form = document.createElement('form');
    let btn   = document.createElement('button');
    btn.classList.add('btn', 'btn-danger');
    btn.innerHTML = _delete();
    if (options.margin) btn.classList.add('m-1');
    if (options.small)  btn.classList.add('btn-sm');
    if (options.float)  btn.classList.add('float-right');
    this.form.appendChild(btn);
    this.form.addEventListener("submit", event => {
        event.preventDefault();
        if (confirm(`Delete ${options.descriptor || `line`}?`)){
            sendData(this.form, 'DELETE', options.path, options.options || {reload: true});
        };
    });
};
function Input (options = {}) {
    this.input = document.createElement('input');
    if (options.classes) {
        options.classes.forEach(e => this.input.classList.add(e))
    } else this.input.classList.add('form-control');
    this.input.setAttribute('type', options.type  || 'text');
    if (options.completeOff) this.input.setAttribute('autocomplete', 'off');
    if (options.name)        this.input.setAttribute('name', options.name);
    if (options.small)       this.input.classList.add('form-control-sm');
    if (options.value)       this.input.setAttribute('value', options.value);
    if (options.maxlength)   this.input.setAttribute('maxlength', options.maxlength);
    if (options.id)          this.input.setAttribute('id', options.id);
    if (options.placeholder) this.input.setAttribute('placeholder', options.placeholder);
    if (options.required)    this.input.setAttribute('required', true);
    if (options.onChange)    this.input.addEventListener('change', function (event) {options.onChange()});
    if (options.keyUp)       this.input.addEventListener('keyup', function (event) {options.keyUp()});
};
function Select (options = {}) {
    this.select  = document.createElement('select');
    if (options.classes) {
        options.classes.forEach(e => this.select.classList.add(e))
    } else this.select.classList.add('form-control');
    if (options.name)     this.select.setAttribute('name', options.name);
    if (options.small)    this.select.classList.add('form-control-sm');
    if (options.required) this.select.required = true;
    if (options.id)       this.select.id = options.id;
    if (options.size)     this.select.setAttribute('size', options.size);
    if (options.options)  options.options.forEach(e => this.select.appendChild(new Option(e).option));
};
function Option (options = {}) {
    this.option = document.createElement('option');
    let _text = '', pre_text = '';
    if (options.selected === true) {
        this.option.setAttribute('selected', true);
        if (options.star_default) {
            _text = '***';
            pre_text = '***'
        } else if (options.default === true) _text = ' (default)';
    };
    this.option.value     = options.value;
    this.option.innerText = pre_text + options.text + _text;
};
function Card (options = {}) {
    this.div = document.createElement('div');
    let _a        = document.createElement('a'),
        _header   = document.createElement('div'),
        _title    = document.createElement('h3'),
        _body     = document.createElement('div'),
        _body_p   = document.createElement('p');
    if (options.search) this.div.dataset.search = options.search;
    this.div.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3', 'card_div');
    if (options.id) this.div.id = options.id;
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
    this.div.appendChild(_a);
};
function Toast (options = {}) {
    this.toast = document.createElement('div');
    this.toast.id = options.id || `toast_${random_id}`;
    this.toast.setAttribute('role', 'alert');
    this.toast.setAttribute('aria-live', 'assertive');
    this.toast.setAttribute('aria-atomic', 'true');
    this.toast.classList.add('toast', 'float-right');
    this.toast.setAttribute('data-autohide', 'false');
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
    this.toast.appendChild(header);
    body.classList.add('toast-body', 'toast-warn');
    body.innerText = options.text || '';
    this.toast.appendChild(body);
};
function Column (options = {}) {
    this.th = document.createElement('th');
    this.th.id = options.id || `th_${random_id}`;
    if (options.classes) options.classes.forEach(e => this.th.classList.add(e));
    if (options.onclick) this.th.setAttribute('onclick', options.onclick);
    if (options.html) this.th.innerHTML = options.html
    else this.th.innerText = options.text || '';
};
function Spinner (options = {}) {
    this.spinner = document.createElement('div');
    this.spinner.id = `spn_${options.id || random_id}`;
    this.spinner.classList.add('spinner-border', 'text-primary', 'hidden');
    this.spinner.setAttribute('role', 'status');
    this.spinner.innerHTML = '<span class="sr-only">Loading...</span>';
};
function Notification (options = {}) {
    this.notification = document.createElement('li');
    this.notification.classList.add('alert', 'my-1', 'p-1', 'notification');
    if (options.urgency === 1) this.notification.classList.add('alert-success')
    else if (options.urgency === 2) this.notification.classList.add('alert-warning')
    else if (options.urgency === 3) this.notification.classList.add('alert-danger')
    else this.notification.classList.add('alert-info')
    this.notification.setAttribute('role', 'alert', 'my-1', 'p-1', 'notification');
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
    this.notification.appendChild(heading);
    this.notification.appendChild(body);
};
function Input_Group (options = {}) {
    this.group  = document.createElement('div')
    let prepend = document.createElement('div'),
        title   = document.createElement('span');
    this.group.classList.add('input-group', 'mb-1');
    prepend.classList.add('input-group-prepend', 'w-30');
    title.classList.add('input-group-text', 'w-100');
    title.innerText = options.title || '';
    prepend.appendChild(title);
    this.group.appendChild(prepend);
    if (options.text) {
        let text = document.createElement('p');
        text.classList.add('form-control');
        text.innerText = options.text || '';
        this.group.appendChild(text);
    } else if (options.input) {
        this.group.appendChild(options.input);
    };
    if (options.link) {
        let append = document.createElement('div'),
            link   = document.createElement('a');
        append.classList.add('input-group-append');
        link.classList.add('btn', 'btn-primary');
        link.setAttribute('href', options.link);
        link.innerHTML = '<i class="fas fa-search"></i>';
        append.appendChild(link);
        this.group.appendChild(append);
    };
};
function Modal (options = {}) {
    this.modal = document.createElement('div');
    let mdl_dialog  = document.createElement('div'),
        mdl_content = document.createElement('div'),
        mdl_header  = document.createElement('div'),
        mdl_title   = document.createElement('h5'),
        mdl_body    = document.createElement('div'),
        mdl_footer  = document.createElement('div'),
        mdl_close   = document.createElement('button');
    this.modal.setAttribute('id', `mdl_${options.id}`);
    this.modal.setAttribute('tabindex', '-1');
    this.modal.setAttribute('aria-labelledby', `mdl_${options.id}_title`);
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.classList.add('modal', 'fade');
    if (options.static === true) this.modal.setAttribute('data-backdrop', 'static');
    mdl_dialog.classList.add('modal-dialog');
    mdl_content.classList.add('modal-content');
    mdl_header.classList.add('modal-header');
    mdl_header.setAttribute('id', `mdl_${options.id}_header`);
    mdl_title.classList.add('modal-title');
    mdl_title.setAttribute('id', `mdl_${options.id}_title`);
    mdl_header.appendChild(mdl_title);
    mdl_body.setAttribute('id', `mdl_${options.id}_body`)
    mdl_body.classList.add('modal-body');
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
    this.modal.appendChild(mdl_dialog);
};
boolean_to_yesno = boolean => {
    if (boolean === 1 || boolean === true) return 'Yes'
    else return 'No'
};
add_cell = (row, options = {}) => {
    let cell = row.insertCell();
    if (options.sort)      cell.dataset.sort = options.sort;
    if (options.text)      cell.innerText = options.text || '';
    else if (options.html) cell.innerHTML = options.html || '';
    if (options.classes)   options.classes.forEach(e => cell.classList.add(e));
    if (options.append)    cell.appendChild(options.append);
    if (options.id)        cell.id = options.id;
    if (options.ellipsis)  cell.classList.add('ellipsis1');
};