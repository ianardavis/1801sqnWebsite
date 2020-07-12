showItem = items => {
    if (items.length === 1) {
        for (let [id, value] of Object.entries(items[0])) {
            try {
                let element = document.querySelector('#' + id);
                if (['category', 'group', 'type', 'subtype'].includes(id) && value) {
                    let _element = document.querySelector(`#_${id}`);
                    _element.innerText = value[`_${id}`];
                } else if (element) {
                    element.innerText = value;
                    if (id === '_size_text') {
                        let size_text = document.querySelector('#size_text');
                        size_text.innerText = value;
                    };
                };
            } catch (error) {console.log(error)};
        };
        let breadcrumb = document.querySelector('#breadcrumb');
        breadcrumb.innerText = items[0]._description;
        breadcrumb.href = `/stores/items/${items[0].item_id}`;

        let _edit = document.querySelector('#edit_link');
        if (_edit) _edit.href = `javascript:edit("items",${items[0].item_id})`;
        
        let add_size = document.querySelector('#add_size');
        if (add_size) add_size.href = `javascript:add("sizes",{"queries":"item_id=${items[0].item_id}"})`;
    } else alert(`${items.length} matching items found`);
};