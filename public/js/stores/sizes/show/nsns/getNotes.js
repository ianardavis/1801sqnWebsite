function getNSNNotes(nsn_id, permissions) {
    let nsn_sel_system = document.querySelector('#nsn_sel_system') || {value: ''};
    if (permissions.add) {
        set_attribute({id: 'btn_nsn_note_add', attribute: 'data-_table', value: 'nsns'});
        set_attribute({id: 'btn_nsn_note_add', attribute: 'data-_id',    value: nsn_id});
        set_attribute({id: 'btn_nsn_note_add', attribute: 'data-source', value: 'NSN'});
    };
    get(
        function(notes, options) {
            let tbl_nsn_notes = document.querySelector('#tbl_nsn_notes');
            if (tbl_nsn_notes) {
                tbl_nsn_notes.innerHTML = '';
                set_count({id: 'nsn_note', count: notes.length});
                notes.forEach(note => {
                    let row = tbl_nsn_notes.insertRow(-1);
                    add_cell(row, table_date(note.createdAt, true));
                    if (note._system === 1) add_cell(row, {html: '<i class="fas fa-check"></i>'})
                    else                    add_cell(row);
                    add_cell(row, {text: note._note});
                    add_cell(row, {text: print_user(note.user)});
                    if (permissions.edit) add_cell(row, {append: 
                        new Link({
                            type: 'edit',
                            small: true,
                            modal: 'note_edit',
                            source: 'nsn_view',
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
            query: ['_table=nsns',`_id=${nsn_id}`, nsn_sel_system.value],
            spinner: 'nsn_notes'
        }
    );
};