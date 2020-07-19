function _check ()  {return '<i class="fas fa-check"></i>'}
function _search () {return '<i class="fas fa-search"></i>'}
function _globe ()  {return '<i class="fas fa-globe-europe"></i>'}
function _edit ()   {return '<i class="fas fa-pencil-alt"></i>'}
function _save ()   {return '<i class="fas fa-save"></i>'}
function _copy ()   {return '<i class="fas fa-clipboard"></i>'}
function _delete () {return '<i class="fas fa-trash-alt"></i>'}
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
    this.input.type  = options.type  || 'text';
    this.input.name  = options.name  || 'selected[]';
    if (options.value)       this.input.value = options.value;
    if (options.small)       this.input.classList.add('form-control-sm')
    if (options.id)          this.input.id          = options.id;
    if (options.placeholder) this.input.placeholder = options.placeholder;
    if (options.required)    this.input.required    = true;
    if (options.onChange)    this.input.addEventListener('change', event => options.onChange());
};
function Select (options = {}) {
    this.select  = document.createElement('select');
    this.select.classList.add('form-control');
    this.select.name = options.name || 'selected[]';
    if (options.small)    this.select.classList.add('form-control-sm');
    if (options.required) this.select.required = true;
    if (options.id)       this.select.id = options.id;
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
boolean_to_yesno = boolean => {
    if (boolean === 1 || boolean === true) return 'Yes'
    else return 'No'
};
add_cell = (row, options = {}) => {
    let cell = row.insertCell();
    if (options.sort)      cell.dataset.sort = options.sort;
    if (options.text)      cell.innerText = options.text || '';
    else if (options.html) cell.innerHTML = options.html || '';
    if (options.classes)   options.classes.forEach(_class => cell.classList.add(_class));
    if (options.append)    cell.appendChild(options.append);
    if (options.id)        cell.id = options.id;
    if (options.ellipsis)  cell.classList.add('ellipsis1');
};