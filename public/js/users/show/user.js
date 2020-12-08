showUser = (users, options) => {
    ['user','requests','orders','demands'].forEach(e => clearElement(`modals_${e}`));
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
        if (options.permissions.user.edit) {
            let modals = document.querySelector('#modals_user');
            modals.appendChild(new Modal({
                id: 'change_password',
                static: true,
                title: 'Change Password'
            }).e);
            let chg_pwd_body  = document.querySelector('#mdl_change_password_body');
            if (chg_pwd_body) {
                let form = document.createElement('form');
                form.setAttribute('id', 'form_password_change')
                form.appendChild(new Input_Group({title: 'Password', append: new Input({id: '_password', type: 'password', required: true, minlength: 8, name: '_password'}).e}).e);
                form.appendChild(new Input_Group({title: 'Confirm',  append: new Input({id: '_confirm',  type: 'password', required: true, minlength: 8}).e}).e);
                form.appendChild(new Password_Requirements().e)
                form.appendChild(new Input({id: 'password_save', type: 'submit', value: 'Save', disabled: true, classes: ['btn', 'btn-success']}).e);
                chg_pwd_body.appendChild(form);
                addFormListener(
                    'form_password_change',
                    'PUT',
                    `/stores/password/${users[0].user_id}`,
                    {onComplete: [window.getUser, function () {$('#mdl_change_password').modal('hide')}]}
                );
                document.querySelector('#_password').addEventListener('keyup', () => pwd_compare());
                document.querySelector('#_confirm').addEventListener('keyup', () => pwd_compare());
            };
        };
        if (pwd_chg)   pwd_chg.href   = `javascript:$('#mdl_change_password').modal('show')`;
        if (perm_edit) perm_edit.href = `javascript:edit("permissions",${users[0].user_id})`;
        if (_edit)     _edit.href     = `javascript:edit("users",${users[0].user_id})`;
    } else alert(`${users.length} matching users found`);
};