var _bader    = document.querySelector("#inp_bader"),
    _name     = document.querySelector("#inp_name"),
    _ini      = document.querySelector("#inp_ini"),
    _login_id = document.querySelector("#inp_login_id"),
    rank_id   = document.querySelector("#inp_status_id"),
    status_id = document.querySelector("#inp_rank_id"),
    _save     = document.querySelector("#save_user");
function check_fields() {
    if (_bader.value    !== '' && 
        _name.value     !== '' && 
        _ini.value      !== '' && 
        _login_id.value !== '' && 
        rank_id.value   !== '' && 
        status_id.value !== '') {
        _save.disabled = false
    } else _save.disabled = true;
};
window.addEventListener('load', function () {
    _bader.addEventListener('input',     check_fields);
    _name.addEventListener('input',      check_fields);
    _ini.addEventListener('input',       check_fields);
    _login_id.addEventListener('input',  check_fields);
    rank_id.addEventListener('change',   check_fields);
    status_id.addEventListener('change', check_fields);
});
