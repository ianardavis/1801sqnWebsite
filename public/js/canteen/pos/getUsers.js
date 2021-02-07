function getUsers() {
    get(
        {
            db:    'users',
            table: 'current',
            query: []
        },
        function (users, options) {
            clearElement('current');
            let _users = document.querySelector('#current');
            _users.appendChild(new Option({value: '', text: 'Select User'}).e)
            users.forEach(user => {
                _users.appendChild(new Option({value: user.user_id, text: `${user.rank._rank} ${user.full_name}`}).e)
            });
        }
    )
};
document.querySelector('#reload_users').addEventListener('click', getUsers);