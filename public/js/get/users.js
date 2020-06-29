getUsers = (query = [], selected = -1) => {
    show_spinner('users');
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText),
            _select  = document.querySelector('#usersSelect');
        _select.innerHTML = '';
        if (response.result) {
            _select.appendChild(_option('', ''));
            response.users.forEach(user => {
                _select.appendChild(
                    _option({
                        value:     user.user_id, 
                        text:      user.rank._rank + ' ' + user.full_name,
                        selected: (user.user_id === selected)
                    })
                );
            });
        } else alert('Error: ' + response.error);
        hide_spinner('users');
    });
    XHR_send(XHR, 'users', '/stores/get/users?' + query.join('&'));
};