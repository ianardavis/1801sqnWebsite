function getSerials() {
    get(
        function (serials, options) {
            try {
                clearElement('tbl_serials');
                let tbl_serials = document.querySelector('#tbl_serials');
                set_count({id: 'serial', count: serials.length});
                if (tbl_serials) {
                    serials.forEach(serial => {
                        let row = tbl_serials.insertRow(-1);
                        add_cell(row, {text: serial._serial});
                        add_cell(row, {text: serial.location._location});
                        add_cell(row, {append: new Link({
                            modal: 'serial_view',
                            data:  {field: 'serial_id', value: serial.serial_id},
                            small: true
                        }).e}
                        );
                    });
                };
            } catch (error) {console.log(error)};
        },
        {
            table: 'serials',
            query: [`size_id=${path[3]}`]
        }
    );
};
function getSerialView(serial_id, permissions) {
    get(
        function(serial, options) {
            set_innerText({id: 'serial_location', text: serial.location._location});
            set_innerText({id: '_serial_view',    text: serial._serial});
            set_innerText({id: 'serial_id',       text: serial.serial_id});
            if (permissions.edit === true || permissions.delete === true) {
                let serial_buttons = document.querySelector('#serial_buttons');
                if (serial_buttons) {
                    serial_buttons.innerHTML = '';
                    if (permissions.delete) {
                        serial_buttons.appendChild(
                            new Delete_Button({
                                path:       `/stores/serials/${serial.serial_id}`,
                                descriptor: 'Serial',
                                float:      true,
                                options: {
                                    onComplete: [
                                        getSerials,
                                        function () {$('mdl_serial_view').modal('hide')}
                                    ]
                                }
                            }).e
                        );
                    };
                    if (permissions.edit) {
                        serial_buttons.appendChild(
                            new Button({
                                id:   'btn_serial_edit',
                                type: 'success',
                                html: '<i class="fas fa-pencil-alt"></i>',
                                click: edit_serial
                            }).e
                        );
                    };
                };
            };
        },
        {
            table: 'serial',
            query: [`serial_id=${serial_id}`],
            spinner: 'serial_view'
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSerials);