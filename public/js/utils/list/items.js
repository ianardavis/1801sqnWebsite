function listItems(options = {}) {
    return new Promise((resolve, reject) => {
        clear_select(options.select)
        .then(tbl_items => {
            if (options.blank) tbl_items.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
            get({
                table: 'items',
                ...options
            })
            .then(function ([items, options]) {
                items.forEach(item => {
                    tbl_items.appendChild(new Option({
                        value:    (options.id_only ? item.item_id : `item_id=${item.item_id}`),
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