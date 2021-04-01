function listSizes(options = {}) {
    return new Promise((resolve, reject) => {
        let select = document.querySelector(`#${options.select}`);
        if (select) {
            select.innerHTML = '';
            if (options.blank) select.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
            get(
                {
                    table: 'sizes',
                    query: options.query || [],
                    ...options
                },
                function (sizes, options) {
                    sizes.forEach(size => {
                        select.appendChild(new Option({
                            value:    (options.id_only ? size.size_id : `size_id=${size.size_id}`),
                            text:     size.size,
                            selected: (options.selected === size.size_id)
                        }).e);
                    });
                    resolve(true);
                }
            )
            .catch(err => reject(err));
        } else reject(new Error('Size select not found'));
    });
};