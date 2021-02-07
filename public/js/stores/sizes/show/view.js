function getSize() {
    get(
        {
            table: 'size',
            query: [`size_id=${path[3]}`]
        },
        function (size, options) {
            set_innerText({id: '_issueable',        text: yesno(size._issueable)});
            set_innerText({id: '_orderable',        text: yesno(size._orderable)});
            set_innerText({id: '_serials',          text: yesno(size._serials)});
            set_innerText({id: '_nsns',             text: yesno(size._nsns)});
            set_innerText({id: 'supplier',          text: size.supplier._name});
            set_attribute({id: 'supplier_link',     attribute: 'href', value: `/stores/suppliers/${size.supplier_id}`});
            set_innerText({id: '_demand_page',      text: size._demand_page});
            set_innerText({id: '_demand_cell',      text: size._demand_cell});
            set_innerText({id: '_ordering_details', text: size._ordering_details});
            set_attribute({id: 'size_id_detail',    attribute: 'value', value: size.size_id});
            let stock_elements  = document.querySelectorAll('._stock_element'),
                serial_elements = document.querySelectorAll('._serials_element');
            if (size._serials) {
                stock_elements.forEach(e => e.classList.add('hidden'));
                serial_elements.forEach(e => e.classList.remove('hidden'));
            } else {
                stock_elements.forEach(e => e.classList.remove('hidden'));
                serial_elements.forEach(e => e.classList.add('hidden'));
            };
            ['_issueable', '_orderable', '_nsns'].forEach(e => {
                if (size[e]) document.querySelectorAll(`.${e}_element`).forEach(e => e.classList.remove('hidden'))
                else         document.querySelectorAll(`.${e}_element`).forEach(e => e.classList.add('hidden'));
            });
            let _item = document.querySelector('#_item');
            _item.innerText = size.item._description;
            _item.href      = `/stores/items/${size.item_id}`;
            set_breadcrumb({text: `${size.item._size_text || 'Size'}: ${size._size}`, href: `/stores/sizes/${size.size_id}`});
            document.querySelectorAll('.size_id').forEach(e => e.setAttribute('value', size.size_id));
        }
    );
};
let details_loaded = false;
function getDetails() {
    details_loaded = false;
    get(
        {
            table: 'details',
            query: [`size_id=${path[3]}`]
        },
        function (details, options) {
            let tbl_details = document.querySelector('#tbl_details');
            if (tbl_details) {
                tbl_details.innerHTML = '';
                details.forEach(detail => {
                    let row = tbl_details.insertRow(-1);
                    add_cell(row, {text: detail._name});
                    add_cell(row, {text: detail._value});
                    add_cell(row, {classes: ['details'], data: {field: 'id', value: detail.detail_id}});
                });
                details_loaded = true;
            };
        }
    );
};
document.querySelector('#reload').addEventListener('click', getDetails);
document.querySelector('#reload').addEventListener('click', getSize);