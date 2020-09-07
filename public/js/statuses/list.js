statuses_select = (statuses, options) => {
    show_spinner('status_id');
    let select = document.querySelector('#status_id');
    select.innerHTML = '';
    statuses.forEach(status => {
        select.appendChild(new Option({
            value: status.status_id,
            text: status._status
        }).option);
    });
    statuses_loaded = true;
    hide_spinner('status_id');
};
