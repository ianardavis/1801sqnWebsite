addFormListener = (form_id, method, location, options = {reload: false, reload_opener: true, _close: true}) => {
    let form = document.querySelector("#" + form_id);
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (method === 'GET' || confirm('Are you sure?')) sendData(form, method, location, options);
    });
};