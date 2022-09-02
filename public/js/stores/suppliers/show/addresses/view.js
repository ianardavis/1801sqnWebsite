function getAddresses() {
    clear('tbl_addresses')
    .then(tbl_addresses => {
        get({
            table: 'addresses',
            where: {supplier_id: path[2]},
            func: getAddresses
        })
        .then(function ([result, options]) {
            set_count('address', result.count);
            result.addresses.forEach(address => {
                let row = tbl_addresses.insertRow(-1);
                add_cell(row, {text: address.type});
                add_cell(row, {text: address.unit_number});
                add_cell(row, {text: address.street});
                add_cell(row, {append: new Modal_Button(
                    _search(),
                    'address_view',
                    [{field: 'id', value: address.supplier_address.supplier_address_id}]
                ).e});
            });
        });
    });
};
function viewAddress(supplier_address_id) {
    get({
        table: 'address',
        where: {supplier_address_id: supplier_address_id},
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
sort_listeners(
    'addresses',
    getAddresses,
    [
        {value: '["type"]',        text: 'Type', selected: true},
        {value: '["unit_number"]', text: 'Unit Number'},
        {value: '["street"]',      text: 'Street'},
        {value: '["town"]',        text: 'Town'},
        {value: '["county"]',      text: 'County'},
        {value: '["country"]',     text: 'Country'},
        {value: '["postcode"]',    text: 'Postcode'},
        {value: '["createdAt"]',   text: 'Created'}
    ]
);
window.addEventListener('load', function () {
    modalOnShow('address_view', function (event) {viewAddress(event.relatedTarget.dataset.id)});
});