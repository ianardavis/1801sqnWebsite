statuses_select = (statuses, options) => {
    show_spinner('status_id');
    clearElement('status_id');
    let select = document.querySelector('#status_id');
    statuses.forEach(status => {
        select.appendChild(new Option({
            value: status.status_id,
            text: status._status
        }).e);
    });
    statuses_loaded = true;
    hide_spinner('status_id');
};
