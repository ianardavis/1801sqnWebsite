function listStatuses(options = {}) {
    return new Promise((resolve, reject) => {
        clear(options.select || 'sel_statuses')
        .then(sel_statuses => {
            if (options.blank) sel_statuses.appendChild(new Option({selected: (!options.selected), text: options.blank.text || ''}).e);
            get({
                table: 'statuses',
                ...options
            })
            .then(function ([result, options]) {
                result.statuses.forEach(status => {
                    sel_statuses.appendChild(new Option({
                        value:    status.status_id,
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