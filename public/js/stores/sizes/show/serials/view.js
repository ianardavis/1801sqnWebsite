function getSerials() {
    clear('tbl_serials')
    .then(tbl_serials => {
        get({
            table: 'serials',
            query: [`size_id=${path[2]}`]
        })
        .then(function ([serials, options]) {
            set_count({id: 'serial', count: serials.length});
                serials.forEach(serial => {
                try {
                    let row = tbl_serials.insertRow(-1);
                    add_cell(row, {text: serial.serial});
                    add_cell(row, {text: (serial.location ? serial.location.location : (serial.issue ? 'Issued' : 'Unknown'))});
                    add_cell(row, {append: new Link({
                        href: `/serials/${serial.serial_id}`,
                        small: true
                    }).e}
                    );
                } catch (error) {console.log(error)};
            });
        });
    });
};
addReloadListener(getSerials);