getTypes = () => {
    show_spinner('types');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText),
            _select  = document.querySelector('#typesSelect');
        _select.innerHTML = '';
        if (response.result) {
            _select.appendChild(_option({value: '', text: ''}));
            response.results.forEach(type => {
                _select.appendChild(
                    _option({
                        value: type.type_id,
                        text: type._type
                    })
                )
            });
        } else alert('Error: ' + response.error);
        hide_spinner('types');
    });
    let query = [],
        group = document.querySelector('#groupsSelect');
    if (group.value !== '') query.push('group_id=' + group.value);
    XHR_send(XHR, 'types', '/stores/get/options/types?' + query.join('&'));
};