getSubTypes = () => {
    show_spinner('subtypes');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText),
            _select  = document.querySelector('#subtypesSelect');
        _select.innerHTML = '';
        if (response.result) {
            _select.appendChild(_option('', ''));
            response.results.forEach(subtypes => _select.appendChild(_option(subtypes.subtype_id, subtypes._subtype)));
        } else alert('Error: ' + response.error);
        hide_spinner('subtypes');
    });
    let query = [],
        type = document.querySelector('#typesSelect');
    if (type.value !== '') query.push('type_id=' + type.value);
    XHR_send(XHR, 'subtypes', '/stores/get/options/subtypes?' + query.join('&'));
};