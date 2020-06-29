function _check ()     {return '<i class="fas fa-check"></i>'}
function _search ()    {return '<i class="fas fa-search"></i>'}
function _globe ()     {return '<i class="fas fa-globe-europe"></i>'}
function _edit ()      {return '<i class="fas fa-pencil-alt"></i>'}
function _save ()      {return '<i class="fas fa-save"></i>'}
function _copy ()      {return '<i class="fas fa-clipboard"></i>'}
function Link (options = {}) {
    this.element      = document.createElement('a');
    this.element.href = options.href ;
    this.element.classList.add('btn');
    if (options._type === 'show') {
        this.element.classList.add('btn-primary');
        this.element.innerHTML = _search();
    } else if (options._type === 'edit') {
        this.element.classList.add('btn-success');
        this.element.innerHTML = _edit();
    } else if (options._type === 'copy') {
        this.element.classList.add('btn-info');
        this.element.innerHTML = _copy();
    };
    if (options.margin) this.element.classList.add('m-1');
    if (options.small)  this.element.classList.add('btn-sm');
    if (options.float)  this.element.classList.add('float-right');
    if (options.id)     this.element.id = options.id;
};
function delete_button (options = {}) {
    let form   = document.createElement('form'),
        button = document.createElement('button');
    button.classList.add('btn', 'btn-danger');
    if (options.margin) button.classList.add('m-1');
    if (options.small)  button.classList.add('btn-sm');
    if (options.float)  button.classList.add('float-right');
    button.innerHTML = '<i class="fas fa-trash-alt"></i>';
    let send_options = {reload: true};
    if (options.options) send_options = options.options;
    form.appendChild(button);
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (confirm('Delete ' + options.descriptor || 'line' + '?')){
            sendData(form, 'DELETE', options.path, send_options);
        };
    });
    return form;
};
function Input (options = {}) {
    this.input = document.createElement('input');
    this.input.type  = options.type  || 'text';
    this.input.name  = options.name  || 'selected[]';
    this.input.value = options.value || '';
    this.input.classList.add('form-control');
    if (options.small)       this.input.classList.add('form-control-sm')
    if (options.id)          this.input.id          = options.id;
    if (options.placeholder) this.input.placeholder = options.placeholder;
    if (options.required)    this.input.required    = true;
    if (options.onChange)    this.input.addEventListener('change', event => options.onChange());
};
_select = (options = {}) => {
    let _select  = document.createElement('select');
    _select.name = options.name || 'selected[]';
    _select.classList.add('form-control');
    if (options.small)    _select.classList.add('form-control-sm');
    if (options.required) _select.required = true;
    if (options.id)       _select.id = options.id;
    return _select
};
_option = (value, innerText) => {
    let _option = document.createElement('option');
    _option.value     = value;
    _option.innerText = innerText;
    return _option
};
card = (options = {}) => {
    let _div      = document.createElement('div'),
        _a        = document.createElement('a'),
        _header   = document.createElement('div'),
        _title    = document.createElement('h3'),
        _subtitle = document.createElement('p'),
        _body     = document.createElement('div'),
        _body_p   = document.createElement('p');
    _div.dataset.search = options.search || null;
    _div.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3', 'search')
    _a.href = options.href;
    _a.classList.add('card', 'm-3', 'text-left');
    _header.classList.add('card-header');
    _title.classList.add('card-title');
    _title.innerText = options.title;
    _header.appendChild(_title);
    if (options.subtitle) {
        _subtitle.innerText = options.subtitle;
        _subtitle.classList.add('card-subtitle', 'text-muted');
        _header.appendChild(_subtitle);
    };
    _body.classList.add('card-body');
    _body_p.classList.add('text-left', 'f-10');
    if (options.body_ellipsis) _body_p.classList.add('ellipsis1');
    _body_p.innerHTML = options.body;
    _body.appendChild(_body_p);
    _a.appendChild(_header);
    _a.appendChild(_body);
    _div.appendChild(_a);
    return _div
};
boolean_to_yesno = boolean => {
    if (boolean === 0 || boolean === true) return 'No'
    else if (boolean === 1  || boolean === false) return 'Yes'
    else return 'No'
};
add_cell = (row, options = {}) => {
    let cell = row.insertCell();
    if (options.sort) cell.dataset.sort = options.sort;
    if (options.text) {
        cell.innerText    = options.text || '';
    } else if (options.html) {
        cell.innerHTML    = options.html || '';
    };
    if (options.classes) options.classes.forEach(_class => cell.classList.add(_class));
    if (options.append)  cell.appendChild(options.append);
    if (options.id)      cell.id = option.id;
};