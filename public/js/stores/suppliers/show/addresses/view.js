function getAddresses() {
    clear_table('addresses')
    .then(tbl_addresses => {
        get({
            table: 'addresses',
            query: [`supplier_id=${path[2]}`]
        })
        .then(function ([addresses, options]) {
            set_count({id: 'address', count: addresses.length || '0'});
            addresses.forEach(address => {
                let row = tbl_addresses.insertRow(-1);
                add_cell(row, {text: address.address.type});
                add_cell(row, {text: address.address.unit_number});
                add_cell(row, {text: address.address.street});
                add_cell(row, {append: new Button({
                    modal: 'address_view',
                    data: {field: 'id', value: address.supplier_address_id},
                    small: true
                }).e});
            });
        });
    });
};
function viewAddress(supplier_address_id) {
    get({
        table: 'address',
        query: [`supplier_address_id=${supplier_address_id}`],
        spinner: 'address_view'
    })
    .then(function ([address, options]) {
        set_innerText({id: 'supplier_address_id', text: address.supplier_address_id});
        set_innerText({id: 'address_id',          text: address.address_id});
        set_innerText({id: 'address_type',        text: address.address.type});
        set_innerText({id: 'address_unit_number', text: address.address.unit_number});
        set_innerText({id: 'address_street',      text: address.address.street});
        set_innerText({id: 'address_town',        text: address.address.town});
        set_innerText({id: 'address_county',      text: address.address.country});
        set_innerText({id: 'address_country',     text: address.address.country});
        set_innerText({id: 'address_postcode',    text: address.address.postcode});
        set_innerText({id: 'address_createdAt',   text: print_date(address.address.createdAt, true)});
        set_innerText({id: 'address_updatedAt',   text: print_date(address.address.updatedAt, true)});
    });
};
addReloadListener(getAddresses);
window.addEventListener('load', function () {
    modalOnShow('address_view', function (event) {viewAddress(event.relatedTarget.dataset.id)});
});