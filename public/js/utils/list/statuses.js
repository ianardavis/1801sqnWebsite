function listStatuses(options = {}) {
    return new Promise((resolve, reject) => {
        clear_select(options.select)
        .then(sel_statuses => {
            if (options.blank === true) sel_statuses.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
            get({
                table: 'statuses',
                ...options
            })
            .then(function ([statuses, options]) {
                statuses.forEach(status => {
                    sel_statuses.appendChild(new Option({
                        value:    (options.id_only ? status.status_id : `status_id=${status.status_id}`),
                        text:     status.status,
                        selected: (options.selected === status.status_id)
                    }).e);
                });
                resolve(true);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
};