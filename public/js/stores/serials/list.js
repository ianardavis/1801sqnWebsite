getSerials = (size_id, line_id, cell) => {
    clearElement(`${cell}_${line_id}`);
    let _cell = document.querySelector(`#${cell}_${line_id}`);
    add_spinner(_cell, {id: `serials_${line_id}`});
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", event => {
        let response = JSON.parse(event.target.responseText);
        if (response.result) {
            let serials = [{value: '', text:  '... Select Serial #'}];
            response.serials.forEach(e => serials.push({value: e.serial_id, text: e._serial}));
            let _serials = new Select({
                small: true,
                name: `actions[line_id${line_id}][serial_id]`,
                required: response.result.required,
                options: serials
            }).e;
            _cell.insertBefore(_serials, document.querySelector(`#spn_serials_${line_id}`));
        } else {
            alert(`Error: ${response.error}`);
        };
        remove_spinner(`serials_${line_id}`);
    });
    XHR.addEventListener("error", () => {
        remove_spinner(`serials_${line_id}`);
        alert('Oops! Something went wrong.');
    });
    XHR.open('GET', `/stores/get/serials?size_id=${size_id}`);
    XHR.send();
};