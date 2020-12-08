var input_login = document.querySelector("#_login_id"),
    input_bader = document.querySelector("#_bader");

input_bader.addEventListener("input", () => {
    input_login.value = input_bader.value;
});