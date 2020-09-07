var _bader    = document.querySelector("#_bader"),
    _name     = document.querySelector("#_name"),
    _ini      = document.querySelector("#_ini"),
    _login_id = document.querySelector("#_login_id"),
    _save     = document.querySelector("#_save");
check_fields = () => {
    if (_bader.value    !== '' && 
        _name.value     !== '' && 
        _ini.value      !== '' && 
        _login_id.value !== '') {
        _save.disabled = false
    } else _save.disabled = true;
};
_bader.addEventListener('input',    check_fields);
_name.addEventListener('input',     check_fields);
_ini.addEventListener('input',      check_fields);
_login_id.addEventListener('input', check_fields);
