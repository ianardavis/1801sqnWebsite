getGroups = () => {
    show_spinner('groups');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText),
            _select  = document.querySelector('#groupsSelect');
        _select.innerHTML = '';
        if (response.result) {
            _select.appendChild(_option({value: '', text: ''}));
            response.results.forEach(group => {
                _select.appendChild(
                    _option({
                        value: group.group_id,
                        text: group._group
                    })
                )
            });
        } else alert('Error: ' + response.error);
        hide_spinner('groups');
    });
    let query = [],
        category = document.querySelector('#categoriesSelect');
    if (category.value !== '') query.push('category_id=' + category.value);
    XHR_send(XHR, 'groups', '/stores/get/options/groups?' + query.join('&'));
};