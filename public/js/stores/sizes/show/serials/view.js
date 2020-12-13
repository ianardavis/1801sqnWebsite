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
function getSerialNotes(serial_id) {
    get(
        function(notes, options) {
            let tbl_serial_notes = document.querySelector('#tbl_serial_notes');
            if (tbl_serial_notes) {
                tbl_serial_notes.innerHTML = '';
                set_count({id: 'serial_note', count: notes.length});
                notes.forEach(note => {
                    let row = tbl_serial_notes.insertRow(-1);
                    add_cell(row, {
                        text: print_date(note.createdAt, true),
                        sort: new Date (note.createdAt).getTime()
                    });
                    if (note._system === 1) add_cell(row, {html: '<i class="fas fa-check"></i>'})
                    else                    add_cell(row);
                    add_cell(row, {text: note._note});
                    add_cell(row, {text: print_user(note.user)});
                    add_cell(row, {append: new Link({type: 'edit', small: true}).e});
                    add_cell(row, {append: new Delete_Button({
                        descriptor: 'note',
                        small: true,
                        path: `/stores/notes/${note.note_id}`,
                        options: {
                            onComplete: getSerialNotes,
                            args: [serial_id]
                        }
                    }).e});
                });
            }
        },
        {
            table: 'notes',
            query: ['_table=serials',`_id=${serial_id}`]
        }
    );
};
function getSerialView(serial_id, permissions) {
    get(
        function(serial, options) {
            set_innerText({id: '_location',    text: serial.location._location});
            set_innerText({id: '_serial_view', text: serial._serial});
            if (permissions.edit === true || permissions.delete === true) {
                let serial_buttons = document.querySelector('#serial_buttons');
                if (serial_buttons) {
                    serial_buttons.innerHTML = '';
                    if (permissions.delete) {
                        serial_buttons.appendChild(
                            new Delete_Button({
                                path: `/stores/serials/${serial.serial_id}`,
                                descriptor: 'Serial',
                                float: true,
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
                                id: 'btn_serial_edit',
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
            query: [`serial_id=${serial_id}`]
        }
    );
};
document.querySelector('#reload').addEventListener('click', getSerials);
$('#mdl_serial_view').on('show.bs.modal', function(event) {getSerialNotes(event.relatedTarget.dataset.serial_id)});