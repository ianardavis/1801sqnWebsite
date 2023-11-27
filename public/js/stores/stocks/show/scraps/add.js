function resetScrapAdd() {
    setValue('adjustment_qty_scrap');
};
function getSize() {
    return new Promise((resolve, reject) => {
        get({
            table: 'stock',
            where: {stock_id: path[2]}
        })
        .then(function ([stock, options]) {
            resolve(stock.size);
        })
        .catch(err => reject(err));
    });
}
function getNSN_Serials() {
    getSize()
    .then(size => {
        getNSNs(size);
        getSerials(size);
    })
};
function getNSNs(size) {
    clear('scrap_add_nsn')
    .then(select => {
        select.setAttribute('disabled', true);
        select.removeAttribute('required');
        if (size.has_nsns) {
            select.removeAttribute('disabled');
            select.setAttribute('required', true);
            select.appendChild(new Option({text: "Select NSN"}).e);
            get({
                table: 'nsns',
                where: {size_id: size.size_id}
            })
            .then(function ([results, options]) {
                results.nsns.forEach(nsn => select.appendChild(new Option({value: nsn.nsn_id, text: print_nsn(nsn)}).e));
            });
        };
    });
};
function getSerials(size) {
    clear('scrap_add_serial')
    .then(select => {
        select.setAttribute('disabled', true);
        select.removeAttribute('required');
        if (size.has_serials) {
            select.removeAttribute('disabled');
            select.setAttribute('required', true);
            select.appendChild(new Option({text: "Select Serial"}).e);
            get({
                table: 'serials',
                where: {size_id: size.size_id}
            })
            .then(function ([results, options]) {
                results.serials.forEach(serial => select.appendChild(new Option({value: serial.serial_id, text: serial.serial}).e));
            });
        };
    });
};
window.addEventListener('load', function () {
    modalOnShow('scrap_add', resetScrapAdd);
    modalOnShow('scrap_add', getNSN_Serials);
    enableButton('scrap_add');
    addFormListener(
        'scrap_add',
        'PUT',
        `/stocks/${path[2]}/scrap`,
        {
            onComplete: [
                getStock,
                function () {modalHide('scrap_add')}
            ]
        }
    );
});