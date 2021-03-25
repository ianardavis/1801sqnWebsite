let inp_service_number = document.querySelector("#inp_service_number"),
    inp_surname        = document.querySelector("#inp_surname"),
    inp_first_name     = document.querySelector("#inp_first_name"),
    inp_login_id       = document.querySelector("#inp_login_id"),
    sel_statuses_add   = document.querySelector("#sel_statuses_add"),
    sel_ranks_add      = document.querySelector("#sel_ranks_add"),
    save_user          = document.querySelector("#save_user");
function check_fields() {
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
    inp_service_number.addEventListener('input',  check_fields);
    inp_surname       .addEventListener('input',  check_fields);
    inp_first_name    .addEventListener('input',  check_fields);
    inp_login_id      .addEventListener('input',  check_fields);
    sel_ranks_add     .addEventListener('change', check_fields);
    sel_statuses_add  .addEventListener('change', check_fields);
});
