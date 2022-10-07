let input_login          = document.querySelector("#inp_login_id"),
    input_service_number = document.querySelector("#inp_service_number");

input_service_number.addEventListener("input", function () {
    input_login.value = input_service_number.value;
});