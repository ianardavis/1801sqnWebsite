var input_login = document.querySelector("#_login_id_inp"),
    input_bader = document.querySelector("#_bader_inp");

input_bader.addEventListener("input", () => {
    input_login.value = input_bader.value;
});