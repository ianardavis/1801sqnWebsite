var input_bader     = document.querySelector("#_bader"),
    input_name      = document.querySelector("#_name"),
    input_ini       = document.querySelector("#_ini"),
    input_login_id  = document.querySelector("#_login_id"),
    input_password  = document.querySelector("#_password"),
    input_confirm   = document.querySelector("#_confirm"),
    btn_submit      = document.querySelector("#_submit");

input_password.addEventListener('input', pwd_compare);
input_confirm.addEventListener('input', pwd_compare);
input_bader.addEventListener('input', checkFilled);
input_name.addEventListener('input', checkFilled);
input_ini.addEventListener('input', checkFilled);
input_login_id.addEventListener('input', checkFilled);
    
function pwd_compare() {
    if (input_password.value !== input_confirm.value) {
        input_password.classList.add('pwd_warn');
        input_confirm.classList.add('pwd_warn');
        checkFilled();
    } else {
        input_password.classList.remove('pwd_warn');
        input_confirm.classList.remove('pwd_warn');
        btn_submit.disabled= false;
    }
}
function checkFilled() {
    if (input_bader.value === '' || 
    input_name.value === '' || 
    input_ini.value === '' || 
    input_login_id.value === '' || 
    input_password.value === '' || 
    input_confirm.value === '') {
        btn_submit.disabled= true;
    } else {
        btn_submit.disabled= false;
    }
}