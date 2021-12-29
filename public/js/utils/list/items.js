function listItems(options = {}) {
    return new Promise((resolve, reject) => {
        clear(options.select || 'sel_items')
        .then(tbl_items => {
            if (options.blank) tbl_items.appendChild(new Option({selected: (!options.selected), text: options.blank.text || ''}).e);
            get({
                table: 'items',
                ...options
            })
            .then(function ([result, options]) {
                result.items.forEach(item => {
                    tbl_items.appendChild(new Option({
                        value:    item.item_id,
                        text:     item.description,
                        selected: (options.selected === item.item_id)
                    }).e);
                });
                resolve(true);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
};