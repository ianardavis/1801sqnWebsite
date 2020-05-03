function _check () {return '<i class="fas fa-check"></i>'}
function _search () {return '<i class="fas fa-search"></i>'}
function _spinner (id) {return '<div id="' + id + '" class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>'}
function link (href, _float = true) {
    let link       = document.createElement('a');
    link.href      = href;
    link.innerHTML = _search();
    link.classList.add('btn', 'btn-sm', 'btn-primary');
    if (_float) link.classList.add('float-right');
    return link;
};
function deleteBtn (path, descriptor = 'line') {
    let form   = document.createElement('form'),
        button = document.createElement('button');
    button.classList.add('btn', 'btn-sm', 'btn-danger');
    button.innerHTML = '<i class="fas fa-trash-alt"></i>';
    form.appendChild(button);
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (confirm('Delete ' + descriptor + '?')){
            sendData(form, 'DELETE', path, {reload: true});
        };
    });
    return form;
};
function _input (options = {}) {
    let _input = document.createElement('input');
    _input.classList.add('form-control', 'form-control-sm');
    _input.type        = options.type        || 'text';
    _input.name        = options.name        || 'selected[]';
    _input.value       = options.value       || '';
    _input.id          = options.id          || '';
    _input.placeholder = options.placeholder || '';
    _input.required    = options.required    || true;
    return _input
};
function checkbox (options = {}) {
    let _checkbox   = document.createElement('input');
    _checkbox.type  = 'checkbox';
    _checkbox.name  = options.name || 'selected[]';
    _checkbox.value = options.id;
    _checkbox.classList.add('form-control', 'form-control-sm');
    return _checkbox
};
function _select (options = {}) {
    let _select      = document.createElement('select');
    _select.classList.add('form-control', 'form-control-sm');
    _select.name     = options.name     || 'selected[]';
    if (options.required) _select.required = true;
    return _select
};
function _option(value, innerText) {
    let _option = document.createElement('option');
    _option.value     = value;
    _option.innerText = innerText;
    return _option
};