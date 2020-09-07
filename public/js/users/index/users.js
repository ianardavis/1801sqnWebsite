showUsers = (users, options) => {
    let table_body = document.querySelector('#userTable');
    table_body.innerHTML = '';
    users.forEach(user => {
        let row = table_body.insertRow(-1);
        add_cell(row, {text: user._bader});
        add_cell(row, {text: user.rank._rank});
        add_cell(row, {text: user._name});
        add_cell(row, {text: user._ini});
        add_cell(row, {append: new Link({
            href: `/stores/users/${user.user_id}`,
            small: true
        }).link});
    });
    hide_spinner('users');
};
user_query = () => {
    let status = document.querySelector('#status_id'),
        query        = [];
    if (status.value !== '') query.push('status_id=' +   status.value);
    return query;
};