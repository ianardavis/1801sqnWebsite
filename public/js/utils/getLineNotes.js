function getLineNotes(options = {}) {
    let select = document.querySelector(`#mdl_${options.line_id}_sel_system`),
        query  = [`_table=${options.table}`, `_id=${options.id}`];
    if (select && select.value) query.push(select.value);
    get(
        function (notes, options = {}) {
            clearElement(`mdl_${options.line_id}_note_lines`);
            let table_body = document.querySelector(`#mdl_${options.line_id}_note_lines`);
            notes.forEach(note => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    sort: new Date(note.createdAt).getTime(),
                    text: new Date(note.createdAt).toDateString()
                });
                add_cell(row, {text: note._note});
                add_cell(row, {text: print_user(note.user)});
            });
        },
        {
            table: 'notes',
            query: query,
            line_id: options.line_id
        }
    );
};