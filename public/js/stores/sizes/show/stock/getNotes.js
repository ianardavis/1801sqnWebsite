function getStockNotes(stock_id, permissions) {
    let stock_sel_system = document.querySelector('#stock_sel_system') || {value: ''};
    if (permissions.add) {
        set_attribute({id: 'btn_stock_note_add', attribute: 'data-_table', value: 'stock'});
        set_attribute({id: 'btn_stock_note_add', attribute: 'data-_id',    value: stock_id});
        set_attribute({id: 'btn_stock_note_add', attribute: 'data-source', value: 'Stock'});
    };
    get(
        function(notes, options) {
            let tbl_stock_notes = document.querySelector('#tbl_stock_notes');
            if (tbl_stock_notes) {
                tbl_stock_notes.innerHTML = '';
                set_count({id: 'stock_note', count: notes.length});
                notes.forEach(note => {
                    try {
                        let row = tbl_stock_notes.insertRow(-1);
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
                                    options: {onComplete: function () {getStockNotes(stock_id, permissions)}}
                                }).e
                            });
                        } else add_cell(row);
                    } catch (error) {
                        console.log(error);
                    };
                });
            }
        },
        {
            table: 'notes',
            query: ['_table=stock',`_id=${stock_id}`, stock_sel_system.value],
            spinner: 'stock_notes'
        }
    );
};