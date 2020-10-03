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
    this.input.classList.add('form-control');
    this.input.setAttribute('type', options.type  || 'text');
    this.input.setAttribute('name', options.name  || 'selected[]');
    if (options.small)       this.input.classList.add('form-control-sm');
    if (options.value)       this.input.setAttribute('value', options.value);
    if (options.maxlength)   this.input.setAttribute('maxlength', options.maxlength);
    if (options.id)          this.input.setAttribute('id', options.id);
    if (options.placeholder) this.input.setAttribute('placeholder', options.placeholder);
    if (options.required)    this.input.setAttribute('required', true);
    if (options.onChange)    this.input.addEventListener('change', event => options.onChange());
};
function Select (options = {}) {
    this.select  = document.createElement('select');
    this.select.classList.add('form-control');
    this.select.name = options.name || 'selected[]';
    if (options.small)    this.select.classList.add('form-control-sm');
    if (options.required) this.select.required = true;
    if (options.id)       this.select.id = options.id;
    if (options.options)  options.options.forEach(e => this.select.appendChild(new Option(e).option));
};
function Option (options = {}) {
    this.option = document.createElement('option');
    let _text = '';
    if (options.selected === true) {
        this.option.setAttribute('selected', true);
        _text = '***';
    };
    this.option.value     = options.value;
    this.option.innerText = _text + options.text + _text;
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
    this.spinner.classList.add('spinner-border', 'text-primary');
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