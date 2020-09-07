let _password  = document.querySelector("#_password"),
    _confirm   = document.querySelector("#_confirm");
_password.addEventListener('input', pwd_compare);
_confirm.addEventListener( 'input', pwd_compare);
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
    if (password_ok) {
        _password.classList.add('pwd_warn');
        _confirm.classList.add( 'pwd_warn');
        _save.disabled = true;
    } else {
        _password.classList.remove('pwd_warn');
        _confirm.classList.remove( 'pwd_warn');
        _save.disabled = false;
    };
};
