let inp_service_number = document.querySelector("#inp_service_number");
let inp_surname        = document.querySelector("#inp_surname");
let inp_first_name     = document.querySelector("#inp_first_name");
let inp_login_id       = document.querySelector("#inp_login_id");
let sel_statuses_add   = document.querySelector("#sel_statuses_add");
let sel_ranks_add      = document.querySelector("#sel_ranks_add");
let save_user          = document.querySelector("#btn_save_user");
function checkFields() {
    if (
        inp_service_number.value !== '' && 
        inp_surname.value        !== '' && 
        inp_first_name.value     !== '' && 
        inp_login_id.value       !== '' && 
        sel_ranks_add.value      !== '' && 
        sel_statuses_add.value   !== ''
    ) {
        save_user.disabled = false
    } else save_user.disabled = true;
};
window.addEventListener('load', function () {
    addListener('inp_service_number', checkFields, 'input');
    addListener('inp_surname',        checkFields, 'input');
    addListener('inp_first_name',     checkFields, 'input');
    addListener('inp_login_id',       checkFields, 'input');
    addListener('sel_ranks_add',      checkFields, 'change');
    addListener('sel_statuses_add',   checkFields, 'change');
});
