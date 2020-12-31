function getSerialNotes(serial_id, permissions) {
    let serial_sel_system = document.querySelector('#serial_sel_system') || {value: ''};
    if (permissions.add) {
        set_attribute({id: 'btn_serial_note_add', attribute: 'data-_table', value: 'serial'});
        set_attribute({id: 'btn_serial_note_add', attribute: 'data-_id',    value: serial_id});
        set_attribute({id: 'btn_serial_note_add', attribute: 'data-source', value: 'Serial'});
    };
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
                    if (permissions.edit) add_cell(row, {append: 
                        new Link({
                            type: 'edit',
                            small: true,
                            modal: 'note_edit',
                            source: 'serial_view',
                            data: {field: 'note_id', value: note.note_id}
                        }).e
                    })
                    else                  add_cell(row)
                    if (permissions.delete) {
                        add_cell(row, {append: 
                            new Delete_Button({
                                descriptor: 'note',
                                small: true,
                                path: `/stores/notes/${note.note_id}`,
                                options: {onComplete: function () {getStockNotes(stock_id)}}
                            }).e
                        });
                    } else add_cell(row);
                });
            }
        },
        {
            table: 'notes',
            query: ['_table=serials', `_id=${serial_id}`, serial_sel_system.value],
            spinner: 'serial_notes'
        }
    );
};