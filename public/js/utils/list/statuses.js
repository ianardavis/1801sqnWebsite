let statuses_loaded = false;
function listStatuses(options = {}) {
    statuses_loaded = false;
    get(
        {
            table: 'statuses',
            ...options
        },
        function (statuses, options) {
            let select = document.querySelector(`#${options.select}`);
            if (select) {
                select.innerHTML = '';
                if (options.blank === true) select.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
                statuses.forEach(status => {
                    let value = null;
                    if (options.id_only) value = status.status_id
                    else                 value = `status_id=${status.status_id}`;
                    select.appendChild(new Option({
                        value:    value,
                        text:     status.status,
                        selected: (options.selected === status.status_id)
                    }).e);
                });
                statuses_loaded = true;
            };
        }
    );
};