function showUsers([users, options]) {
    clearElement('usersSelect');
    let _select  = document.querySelector('#usersSelect');
    _select.appendChild(new Option({value: '', text: ''}).e);
    users.forEach(user => {
        _select.appendChild(
            new Option({
                value:     user.user_id, 
                text:      user.rank._rank + ' ' + user.full_name,
                selected: (user.user_id === options.selected)
            }).e
        );
    });
    hide_spinner('users');
};