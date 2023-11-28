function getAddresses() {
    clear('tbl_addresses')
    .then(tbl_addresses => {
        get({
            table: 'addresses',
            where: {supplier_id: path[2]},
            func: getAddresses
        })
        .then(function ([result, options]) {
            setCount('address', result.count);
            result.addresses.forEach(address => {
                let row = tbl_addresses.insertRow(-1);
                addCell(row, {text: address.type});
                addCell(row, {text: address.unit_number});
                addCell(row, {text: address.street});
                addCell(row, {append: new Modal_Button(
                    _search(),
                    'address_view',
                    [{field: 'id', value: address.suppliers[0].supplier_addresses.supplier_address_id}]
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
        setInnerText('supplier_address_id', address.supplier_address_id);
        setInnerText('address_id',          address.address_id);
        setInnerText('address_type',        address.address.type);
        setInnerText('address_unit_number', address.address.unit_number);
        setInnerText('address_street',      address.address.street);
        setInnerText('address_town',        address.address.town);
        setInnerText('address_county',      address.address.country);
        setInnerText('address_country',     address.address.country);
        setInnerText('address_postcode',    address.address.postcode);
        setInnerText('address_createdAt',   printDate(address.address.createdAt, true));
        setInnerText('address_updatedAt',   printDate(address.address.updatedAt, true));
    });
};
window.addEventListener('load', function () {
    addListener('reload', getAddresses);
    modalOnShow('address_view', function (event) {viewAddress(event.relatedTarget.dataset.id)});
    addSortListeners('addresses', getAddresses);
    getAddresses();
});