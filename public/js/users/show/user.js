showUser = (users, options) => {
    if (users.length === 1) {
        for (let [id, value] of Object.entries(users[0])) {
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
        let breadcrumb = document.querySelector('#breadcrumb'),
            pwd_rst    = document.querySelector('#btn_pwd_rst'),
            pwd_chg    = document.querySelector('#btn_pwd_chg'),
            perm_edit  = document.querySelector('#btn_perm_edit'),
            user_ids   = document.querySelectorAll('.user_id'),
            _edit      = document.querySelector('#edit_link');
        breadcrumb.innerText = `${users[0].rank._rank} ${users[0].full_name}`;
        breadcrumb.href      = `/stores/users/${users[0].user_id}`;
        user_ids.forEach(e => e.value = users[0].user_id);
        if (pwd_rst) {
            if (users[0]._reset === 0) pwd_rst.value = '1'
            else if (users[0]._reset === 1) pwd_rst.value = '0'
        };
        if (pwd_chg)   pwd_chg.href  = `javascript:changePassword(${users[0].user_id})`;
        if (perm_edit) perm_edit.href  = `javascript:edit("permissions",${users[0].user_id})`;
        if (_edit)      _edit.href      = `javascript:edit("users",${users[0].user_id})`;
    } else alert(`${users.length} matching users found`);
};