var input_bader     = document.querySelector("#_bader"),
    input_name      = document.querySelector("#_name"),
    input_ini       = document.querySelector("#_ini"),
    input_login_id  = document.querySelector("#_login_id"),
    input_password  = document.querySelector("#_password"),
    input_confirm   = document.querySelector("#_confirm"),
    btn_submit      = document.querySelector("#_save");

checkFilled = () => {
    if (bad_password() || 
        input_bader.value    === '' || 
        input_name.value     === '' || 
        input_ini.value      === '' || 
        input_login_id.value === '' || 
        input_password.value === '' || 
        input_confirm.value  === '') {
        btn_submit.disabled= true;
    } else btn_submit.disabled= false;
};
bad_password = () => {
    if (input_password.value !== input_confirm.value ||
        input_password.value.length < 8) {
            input_password.classList.add('pwd_warn');
            input_confirm.classList.add('pwd_warn');
            return true;
    } else {
        input_password.classList.remove('pwd_warn');
        input_confirm.classList.remove('pwd_warn');
        return false;
    };
};
input_password.addEventListener('input', checkFilled);
input_confirm.addEventListener('input',  checkFilled);
input_bader.addEventListener('input',    checkFilled);
input_name.addEventListener('input',     checkFilled);
input_ini.addEventListener('input',      checkFilled);
input_login_id.addEventListener('input', checkFilled);
