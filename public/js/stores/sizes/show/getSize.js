function getSize() {
    get(
        function (size, options) {
            for (let [id, value] of Object.entries(size)) {
                try {
                    let element = document.querySelector('#' + id);
                    if (['_issueable', '_orderable', '_nsns', '_serials'].includes(id)) {
                        if (id === '_serials') {
                            let stock_elements = document.querySelectorAll('._stock_element');
                            if (value === 1) stock_elements.forEach(e => e.style.display = 'none');
                            else stock_elements.forEach(e => e.style.display = 'in-line block');
                        };
                        let to_hide = document.querySelectorAll(`.${id}_element`);
                        if (value === 1) {
                            to_hide.forEach(e => e.style.display = 'block');
                            element.innerText = 'Yes';
                        } else if (value === 0) {
                            to_hide.forEach(e => e.style.display = 'none');
                            element.innerText = 'No';
                        };
                    } else if (id === 'supplier') element.innerText = value._name
                    else if (element) element.innerText = value;
                } catch (error) {console.log(error)};
            };
            let breadcrumb = document.querySelector('#breadcrumb'),
                _item      = document.querySelector('#_item'),
                add_nsn    = document.querySelector('#add_nsn'),
                add_serial = document.querySelector('#add_serial'),
                add_stock  = document.querySelector('#add_stock'),
                add_order  = document.querySelector('#add_order'),
                _edit      = document.querySelector('#edit_link');
            _item.innerText      = size.item._description;
            _item.href           = `/stores/items/${size.item_id}`;
            breadcrumb.innerText = `Size: ${size._size}`;
            breadcrumb.href      = `/stores/sizes/${size.size_id}`;
            if (add_nsn)    add_nsn.href    = `javascript:add("nsns",{"queries":"size_id=${size.size_id}"})`;
            if (add_serial) add_serial.href = `javascript:add("serials",{"queries":"size_id=${size.size_id}"})`;
            if (add_stock)  add_stock.href  = `javascript:add("stock",{"queries":"size_id=${size.size_id}"})`;
            if (add_order)  add_order.href  = '/stores/orders/new?user=-1';
            if (_edit)      _edit.href      = `javascript:edit("sizes",${size.size_id})`;
        },
        {
            table: 'size',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSize);