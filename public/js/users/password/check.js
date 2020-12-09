password_ok = () => {
    let _password = document.querySelector("#_password"),
        _confirm  = document.querySelector("#_confirm");
    if (_password.value === _confirm.value) {
        let re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (re.test(_password.value)) return true
        else return false;
    } else return false;
};
pwd_compare = () => {
    let _save = document.querySelector("#_save");
    if (password_ok()) {
        _password.classList.add('pwd_warn');
        _confirm.classList.add( 'pwd_warn');
        _save.disabled = true;
    } else {
        _password.classList.remove('pwd_warn');
        _confirm.classList.remove( 'pwd_warn');
        _save.disabled = false;
    };
};
pwd_check = () => {
    let _password = document.querySelector('#_password'),
        _special  = /^(?=.*[!?@#$£%^&*])/,
        _number   = /^(?=.*\d)/,
        _upper    = /^(?=.*[A-Z])/,
        _lower    = /^(?=.*[a-z])/,
        _length   = /^.{8,}$/;
    display_checker('pwd_special', _special.test(_password.value));
    display_checker('pwd_number',  _number.test(_password.value));
    display_checker('pwd_upper',   _upper.test(_password.value));
    display_checker('pwd_lower',   _lower.test(_password.value));
    display_checker('pwd_length',  _length.test(_password.value));
};
display_checker = (id, status) => {
    _id = document.querySelector(`#${id}`)
    if (status) {
        _id.classList.remove('badge-danger');
        _id.classList.add('badge-success');
        _id.innerHTML = '<i class="fas fa-check"></i>';
    } else {
        _id.classList.add('badge-danger');
        _id.classList.remove('badge-success');
        _id.innerHTML = '<i class="fas fa-times"></i>';
    };
};