function getSerials() {
    get(
        {
            table: 'serials',
            query: [`size_id=${path[2]}`]
        },
        function (serials, options) {
                set_count({id: 'serial', count: serials.length});
                let tbl_serials = document.querySelector('#tbl_serials');
                if (tbl_serials) {
                    tbl_serials.innerHTML = '';
                    serials.forEach(serial => {
                    try {
                        let row = tbl_serials.insertRow(-1);
                        add_cell(row, {text: serial._serial});
                        if (serial.location)   add_cell(row, {text: serial.location._location});
                        else if (serial.issue) add_cell(row, {text: 'Issued'})
                        else                   add_cell(row, {text: 'Unknown'});
                        add_cell(row, {append: new Link({
                            modal: 'serial_view',
                            data:  {field: 'serial_id', value: serial.serial_id},
                            small: true
                        }).e}
                        );
                    } catch (error) {console.log(error)};
                });
            };
        }
    );
};
function viewSerial(event) {
    get(
        {
            table: 'serial',
            query: [`serial_id=${event.relatedTarget.dataset.serial_id}`],
            spinner: 'serial_view'
        },
        function(serial, options) {
            set_innerText({id: 'serial_location', text: serial.location._location});
            set_innerText({id: '_serial_view',    text: serial._serial});
            set_innerText({id: 'serial_id',       text: serial.serial_id});
            set_attribute({id: 'btn_serial_link', attribute: 'href', value: `/stores/serials/${serial.serial_id}`});
        }
    );
};
window.addEventListener('load', function () {
    $('#mdl_serial_view').on('show.bs.modal', viewSerial);
    document.querySelector('#reload').addEventListener('click', getSerials);
});