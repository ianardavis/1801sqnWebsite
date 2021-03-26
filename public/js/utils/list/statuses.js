function listStatuses(options = {}) {
    return new Promise((resolve, reject) => {
        let select = document.querySelector(`#${options.select}`);
        if (select) {
            select.innerHTML = '';
            if (options.blank === true) select.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
            get(
                {
                    table: 'statuses',
                    ...options
                },
                function (statuses, options) {
                    statuses.forEach(status => {
                        select.appendChild(new Option({
                            value:    (options.id_only ? status.status_id : `status_id=${status.status_id}`),
                            text:     status.status,
                            selected: (options.selected === status.status_id)
                        }).e);
                    });
                    resolve(true);
                }
            )
            .catch(err => reject(err));
        } else reject(new Error('Status select not found'));
    });
};