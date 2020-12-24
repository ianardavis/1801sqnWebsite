function addFormListener(form_id, method, location, options = {reload: false, reload_opener: true, _close: true}, log = false) {
    try {
        let form = document.querySelector(`#${form_id}`);
        if (form) {
            let submit_func = function (event) {
                event.preventDefault();
                if (
                    method.toUpperCase() === 'GET' ||
                    options.noConfirm === true     ||
                    confirm('Are you sure?')
                ) sendData(form, method, location, options);
            };
            form.addEventListener("submit", submit_func);
            if (log) event_listeners.push({id: form_id, function: submit_func});
        } else console.log(`${form_id} not found`);
    } catch (error) {
        console.log(`Error on form: ${form_id}`, error, )
    };
};