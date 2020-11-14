showSize = (sizes, options) => {
    if (sizes.length === 1) {
        for (let [id, value] of Object.entries(sizes[0])) {
            console.log(id, value);
            try {
                let element = document.querySelector('#' + id);
                if (id === 'item') {
                    let item = document.querySelector('#_item');
                    item.innerText = value._description
                } else if (id === '_size') {
                    let size = document.querySelector('#_size');
                    size.innerText = value;
                } else if (id === 'supplier_id') {
                    element.value = value;
                } else if (element) element.value = value;
            } catch (error) {console.log(error)};
        };
    } else alert(`${sizes.length} matching sizes found`);
};