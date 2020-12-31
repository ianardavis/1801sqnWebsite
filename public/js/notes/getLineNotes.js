function getLineNotes(options = {}) {
    let select = document.querySelector(`#mdl_${options.line_id}_sel_system`),
        query  = [`_table=${options.table}`, `_id=${options.id}`];
    if (select && select.value) query.push(select.value);
    get(
        function (notes, _options) {
            let table_body = document.querySelector(`#tbl_${_options.line_id}_notes`);
            set_count({id: `${_options.line_id}_note`, count: notes.length || '0'});
            if (table_body) {
                table_body.innerHTML = '';
                notes.forEach(note => {
                    let row = table_body.insertRow(-1);
                    add_cell(row, {
                        sort: new Date(note.createdAt).getTime(),
                        text: print_date(note.createdAt, true)
                    });
                    add_cell(row, {text: yesno(note._system)})
                    add_cell(row, {text: note._note});
                    add_cell(row, {text: print_user(note.user)});
                    if (note._system) {
                        add_cell(row);
                        add_cell(row);
                    } else {
                        add_cell(row, {
                            append: new Link({
                                small: true,
                                type: 'edit',
                                modal: 'note_edit',
                                source: 'line_view',
                                data: {field: 'note_id', value: note.note_id}
                            }).e
                        });
                        add_cell(row, {
                            append: new Delete_Button({
                                small: true,
                                path: `/stores/notes/${note.note_id}`,
                                options: {onComplete: function () {getLineNotes(options)}}
                            }).e
                        });
                    };
                });
            };
        },
        {
            table: 'notes',
            query: query,
            line_id: options.line_id
        }
    );
};