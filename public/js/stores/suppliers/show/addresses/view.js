function getAddresses() {
    clear('tbl_addresses')
    .then(tbl_addresses => {
        get({
            table: 'addresses',
            query: [`"supplier_id":"${path[2]}"`],
            ...sort_query(tbl_addresses)
        })
        .then(function ([addresses, options]) {
            set_count('address', addresses.length || '0');
            addresses.forEach(address => {
                let row = tbl_addresses.insertRow(-1);
                add_cell(row, {text: address.address.type});
                add_cell(row, {text: address.address.unit_number});
                add_cell(row, {text: address.address.street});
                add_cell(row, {append: new Button({
                    modal: 'address_view',
                    data: [{field: 'id', value: address.supplier_address_id}],
                    small: true
                }).e});
            });
        });
    });
};
function viewAddress(supplier_address_id) {
    get({
        table: 'address',
        query: [`"supplier_address_id":"${supplier_address_id}"`],
        spinner: 'address_view'
    })
    .then(function ([address, options]) {
        set_innerText('supplier_address_id', address.supplier_address_id);
        set_innerText('address_id',          address.address_id);
        set_innerText('address_type',        address.address.type);
        set_innerText('address_unit_number', address.address.unit_number);
        set_innerText('address_street',      address.address.street);
        set_innerText('address_town',        address.address.town);
        set_innerText('address_county',      address.address.country);
        set_innerText('address_country',     address.address.country);
        set_innerText('address_postcode',    address.address.postcode);
        set_innerText('address_createdAt',   print_date(address.address.createdAt, true));
        set_innerText('address_updatedAt',   print_date(address.address.updatedAt, true));
    });
};
addReloadListener(getAddresses);
window.addEventListener('load', function () {
    modalOnShow('address_view', function (event) {viewAddress(event.relatedTarget.dataset.id)});
});