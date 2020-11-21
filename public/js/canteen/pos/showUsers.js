function showUsers(users, options) {
    let credit = document.querySelector('#credit');
    credit.innerHTML = ''
    credit.appendChild(new Option({value: '', text: 'Select Account'}).e)
    users.forEach(user => {
        credit.appendChild(new Option({value: user.user_id, text: `${user.rank._rank} ${user.full_name}`}).e)
    });
};