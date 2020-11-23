function showUsers(users, options) {
    let _users = document.querySelector('#current');
    _users.innerHTML = ''
    _users.appendChild(new Option({value: '', text: 'Select User'}).e)
    users.forEach(user => {
        _users.appendChild(new Option({value: user.user_id, text: `${user.rank._rank} ${user.full_name}`}).e)
    });
};