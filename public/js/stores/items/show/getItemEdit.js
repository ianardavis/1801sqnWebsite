function getItemEdit() {
    get(
        function (item, options) {
            ['description', 'size_text'].forEach(e => {
                try {
                    document.querySelector(`#_${e}_edit`).setAttribute('value', item[`_${e}`]);
                } catch (error) {console.log(error)};
            });
            ['category', 'group', 'type', 'subtype', 'gender'].forEach(e => {
                try {
                    let _element = document.querySelector(`#_${e}`);
                    if (item[e]) {_element.innerText = item[e][`_${e}`]};
                } catch (error) {console.log(error)};
            });
            set_breadcrumb({text: item._description, href: `/stores/items/${item.item_id}`});

            let add_size = document.querySelector('#add_size');
            if (add_size) add_size.href = `javascript:add("sizes",{"queries":"item_id=${item.item_id}"})`;
        },
        {
            table: 'item',
            query: [`item_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getItemEdit);