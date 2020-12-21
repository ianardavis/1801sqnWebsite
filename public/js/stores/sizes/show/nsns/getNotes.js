function getNSNNotes(nsn_id, permissions) {
    let nsn_sel_system = document.querySelector('#nsn_sel_system') || {value: ''};
    get(
        function(notes, options) {
            let tbl_nsn_notes = document.querySelector('#tbl_nsn_notes');
            if (tbl_nsn_notes) {
                tbl_nsn_notes.innerHTML = '';
                set_count({id: 'nsn_note', count: notes.length});
                notes.forEach(note => {
                    let row = tbl_nsn_notes.insertRow(-1);
                    add_cell(row, {
                        text: print_date(note.createdAt, true),
                        sort: new Date (note.createdAt).getTime()
                    });
                    if (note._system === 1) add_cell(row, {html: '<i class="fas fa-check"></i>'})
                    else                    add_cell(row);
                    add_cell(row, {text: note._note});
                    add_cell(row, {text: print_user(note.user)});
                    if (permissions.edit) add_cell(row, {append: new Link({type: 'edit', small: true}).e})
                    else                  add_cell(row)
                    if (permissions.delete) {
                        add_cell(row, {append: 
                            new Delete_Button({
                                descriptor: 'note',
                                small: true,
                                path: `/stores/notes/${note.note_id}`,
                                options: {
                                    onComplete: getStockNotes,
                                    args: [stock_id]
                                }
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