var input_login = document.querySelector("#inp_login_id"),
    input_bader = document.querySelector("#inp_bader");

input_bader.addEventListener("input", function () {
    input_login.value = input_bader.value;
});