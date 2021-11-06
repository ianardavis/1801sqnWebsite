function listSizes(options = {}) {
    return new Promise((resolve, reject) => {
        clear(options.select)
        .then(sel_sizes => {
            if (options.blank) sel_sizes.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
            get({
                table: 'sizes',
                query: options.query || [],
                ...options
            })
            .then(function ([sizes, options]) {
                sizes.forEach(size => {
                    sel_sizes.appendChild(new Option({
                        value:    (options.id_only ? size.size_id : `"size_id":"${size.size_id}"`),
                        text:     print_size(size),
                        selected: (options.selected === size.size_id)
                    }).e);
                });
                resolve(true);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
};