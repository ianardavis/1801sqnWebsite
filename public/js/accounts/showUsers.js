showUsers = (users, options) => {
    let _select  = document.querySelector('#usersSelect');
    _select.innerHTML = '';
    _select.appendChild(new Option({value: '', text: ''}).option);
    users.forEach(user => {
        _select.appendChild(
            new Option({
                value:     user.user_id, 
                text:      user.rank._rank + ' ' + user.full_name,
                selected: (user.user_id === options.selected)
            }).option
        );
    });
    hide_spinner('users');
};
