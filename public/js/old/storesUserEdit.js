var input_login     = document.querySelector("#_login_id"),
    input_bader     = document.querySelector("#_bader"),
    input_password  = document.querySelector("#_password"),
    input_confirm   = document.querySelector("#_confirm"),
    btn_submit      = document.querySelector("#_submit");

input_bader.addEventListener("input", () => {
    input_login.value = input_bader.value;
});

input_password.addEventListener('input', pwd_compare);
input_confirm.addEventListener('input', pwd_compare);

function pwd_compare() {
    if (input_password.value !== input_confirm.value) {
        input_password.classList.add('pwd_warn');
        input_confirm.classList.add('pwd_warn');
        btn_submit.disabled= true;
    } else {
        input_password.classList.remove('pwd_warn');
        input_confirm.classList.remove('pwd_warn');
        btn_submit.disabled= false;
    }
}