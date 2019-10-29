var input_bader     = document.querySelector("#_bader"),
    input_name      = document.querySelector("#_name"),
    input_ini       = document.querySelector("#_ini"),
    input_login_id  = document.querySelector("#_login_id"),
    btn_submit      = document.querySelector("#_submit");

input_bader.addEventListener('input', checkFilled);
input_name.addEventListener('input', checkFilled);
input_ini.addEventListener('input', checkFilled);
input_login_id.addEventListener('input', checkFilled);

function checkFilled() {
    if (input_bader.value === '' || 
    input_name.value === '' || 
    input_ini.value === '' || 
    input_login_id.value === '') {
        btn_submit.disabled= true;
    } else {
        btn_submit.disabled= false;
    }
}