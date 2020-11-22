addFormListener = (form_id, method, location, options = {reload: false, reload_opener: true, _close: true}) => {
    try {
        let form = document.querySelector(`#${form_id}`);
        if (form) {
            form.addEventListener("submit", event => {
                event.preventDefault();
                if (method.toUpperCase() === 'GET' || options.noConfirm === true || confirm('Are you sure?')) sendData(form, method, location, options);
            });
        } else console.log(`${form_id} not found`);
    } catch (error) {
        console.log(`Error on form: ${form_id}`, error, )
    };
};