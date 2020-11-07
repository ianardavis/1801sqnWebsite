function get_line_notes(options = {}) {
    let select = document.querySelector(`#sel_system_modal_line_${options.id}`),
        query  = [`_table=${options.table}`, `_id=${options.id}`];
    if (select && select.value) query.push(select.value);
    get(
        function (notes, options = {}) {
            let table_body = document.querySelector(`#note_lines_mdl_line_${options.line_id}`);
            table_body.innerHTML = '';
            notes.forEach(note => {
                let row = table_body.insertRow(-1);
                add_cell(row, {
                    sort: new Date(note.createdAt).getTime(),
                    text: new Date(note.createdAt).toDateString()
                });
                add_cell(row, {text: note._note});
                add_cell(row, {text: print_user(note.user)});
            });
            hide_spinner('notes');
        },
        {
            table: 'notes',
            query: query,
            line_id: options.id
        }
    );
};