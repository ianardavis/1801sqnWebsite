function getSerials() {
    get(
        function (serials, options) {
            clearElement('tbl_serials');
            let table_body = document.querySelector('#tbl_serials');
            set_count({id: 'serial', count: serials.length});
            serials.forEach(serial => {
                try {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {text: serial._serial});
                    add_cell(row, {text: serial.location._location});
                    add_cell(row, {append: new Link({
                        href: `javascript:show("serials",${serial.serial_id})`,
                        small: true}).e});
                } catch (error) {
                    console.log(error);
                };
            });
        },
        {
            table: 'serials',
            query: [`size_id=${path[3]}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSerials);