function password_ok () {
    let password = document.querySelector("#password"),
        confirm  = document.querySelector("#confirm");
    if (password.value === confirm.value) {
        let re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (re.test(password.value)) return true
        else return false;
    } else return false;
};
function pwd_compare () {
    let _save = document.querySelector("#save_password");
    if (password_ok()) _save.removeAttribute('disabled')
    else               _save.setAttribute('disabled', true);

    let password = document.querySelector('#password'),
        confirm  = document.querySelector("#confirm"),
        special  = /^(?=.*[!?@#$£%^&*])/,
        number   = /^(?=.*\d)/,
        upper    = /^(?=.*[A-Z])/,
        lower    = /^(?=.*[a-z])/,
        length   = /^.{8,}$/;
    display_checker('special', special.test(password.value));
    display_checker('number',  number.test(password.value));
    display_checker('upper',   upper.test(password.value));
    display_checker('lower',   lower.test(password.value));
    display_checker('length',  length.test(password.value));
    display_checker('match',   (password.value === confirm.value));
};
function display_checker (id, status) {
    _id = document.querySelector(`#pwd_${id}`);
    if (status) {
        _id.classList.remove('bg-danger');
        _id.classList.add('bg-success');
        _id.innerHTML = '<i class="fas fa-check"></i>';
    } else {
        _id.classList.add('bg-danger');
        _id.classList.remove('bg-success');
        _id.innerHTML = '<i class="fas fa-times"></i>';
    };
};
window.addEventListener('load', function () {
    addListener('password', pwd_compare, 'input');
    addListener('confirm',  pwd_compare, 'input');
});