statuses_select = (statuses, options) => {
    show_spinner('statuses');
    let select = document.querySelector('#statuses');
    select.innerHTML = '';
    statuses.forEach(status => {
        select.appendChild(new Option({
            value: status.status_id,
            text: status._status
        }).option);
    });
    statuses_loaded = true;
    hide_spinner('statuses');
};