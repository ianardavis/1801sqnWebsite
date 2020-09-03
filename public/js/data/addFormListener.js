addFormListener = (form_id, method, location, options = {reload: false, reload_opener: true, _close: true}) => {
    try {
        let form = document.querySelector("#" + form_id);
        form.addEventListener("submit", event => {
            event.preventDefault();
            if (method.toUpperCase() === 'GET' || confirm('Are you sure?')) sendData(form, method, location, options);
        });
    } catch (error) {
        console.log(`Error on form: ${form_id}`, error, )
    };
};