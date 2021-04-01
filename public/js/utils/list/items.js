function listItems(options = {}) {
    return new Promise((resolve, reject) => {
        let select = document.querySelector(`#${options.select}`);
        if (select) {
            select.innerHTML = '';
            if (options.blank) select.appendChild(new Option({selected: (!options.selected), text: options.blank_text || ''}).e);
            get(
                {
                    table: 'items',
                    ...options
                },
                function (items, options) {
                    items.forEach(item => {
                        select.appendChild(new Option({
                            value:    (options.id_only ? item.item_id : `item_id=${item.item_id}`),
                            text:     item.item,
                            selected: (options.selected === item.item_id)
                        }).e);
                    });
                    resolve(true);
                }
            )
            .catch(err => reject(err));
        } else reject(new Error('Item select not found'));
    });
};