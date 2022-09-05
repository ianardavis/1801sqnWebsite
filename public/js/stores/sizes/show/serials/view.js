function getSerials() {
    clear('tbl_serials')
    .then(tbl_serials => {
        get({
            table: 'serials',
            where: {size_id: path[2]},
            func: getSerials
        })
        .then(function ([result, options]) {
            set_count('serial', result.count);
                result.serials.forEach(serial => {
                try {
                    let row = tbl_serials.insertRow(-1);
                    add_cell(row, {text: serial.serial});
                    add_cell(row, {text: (serial.location ? serial.location.location : (serial.issue ? 'Issued' : 'Unknown'))});
                    add_cell(row, {append: new Link(`/serials/${serial.serial_id}`).e});
                } catch (error) {
                    console.log(error);
                };
            });
        });
    });
};
addReloadListener(getSerials);
window.addEventListener('load', function () {
    add_sort_listeners('serials', getSerials);
    getSerials();
});