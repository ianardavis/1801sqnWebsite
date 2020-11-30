function getUser () {
    get(
        function (user, options) {
            for (let [id, value] of Object.entries(user)) {
                try {
                    let element = document.querySelector('#' + id);
                    if (id === 'rank') element.innerText = value._rank
                    else if (id === '_reset') element.checked = (value === 1)
                    else if (id === 'status') element.innerText = value._status
                    else if (id === '_last_login') {
                        if (value !== null) element.innerText = new Date(value).toDateString()
                        else element.innerText = 'Never';
                    } else if (element) element.innerText = value;
                } catch (error) {console.log(error)};
            };
            let breadcrumb = document.querySelector('#breadcrumb');
            breadcrumb.innerText = `${user.rank._rank} ${user.full_name}`;
            breadcrumb.href      = `/canteen/users/${user.user_id}`;
        },
        {
            db: 'users',
            table: 'user',
            query: [`user_id=${path[3]}`]
        }
    );
    document.querySelector('#reload').addEventListener('click', getUser);
};