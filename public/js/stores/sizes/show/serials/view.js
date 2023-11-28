function getSerials() {
    clear('tbl_serials')
    .then(tbl_serials => {
        get({
            table: 'serials',
            where: {size_id: path[2]},
            func: getSerials
        })
        .then(function ([result, options]) {
            setCount('serial', result.count);
                result.serials.forEach(serial => {
                try {
                    let row = tbl_serials.insertRow(-1);
                    addCell(row, {text: serial.serial});
                    addCell(row, {text: (serial.location ? serial.location.location : (serial.issue ? 'Issued' : 'Unknown'))});
                    addCell(row, {append: new Link(`/serials/${serial.serial_id}`).e});
                } catch (error) {
                    console.error(error);
                };
            });
        });
    });
};
window.addEventListener('load', function () {
    addListener('reload', getSerials);
    addSortListeners('serials', getSerials);
    getSerials();
});