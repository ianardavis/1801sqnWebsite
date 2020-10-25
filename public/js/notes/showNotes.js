showNotes = (notes, options = {}) => {
    let table_body = document.querySelector('#notesTable');
    table_body.innerHTML = '';
    let note_count = document.querySelector('#note_count');
    note_count.innerText = notes.length;
    notes.forEach(note => {
        let row = table_body.insertRow(-1);
        add_cell(row, {
            sort: new Date(note.createdAt).getTime(),
            text: new Date(note.createdAt).toDateString()
        });
        if (note._system) add_cell(row, {html: _check()})
        else add_cell(row);
        add_cell(row, {text: note._note, ellipsis: true});
        add_cell(row, {text: `${note.user.rank._rank} ${note.user.full_name}`});
        if (!note._system) add_cell(row, {append: new Link({
            href: `javascript:edit("notes",${note.note_id})`,
            small: true,
            type: 'edit'
        }).link})
        else add_cell(row);
        if (options.delete_permission && !note._system) {
            add_cell(row, {append: new DeleteButton({
                path: `/stores/notes/${note.note_id}`,
                small: true,
                descriptor: 'note',
                options: {onComplete: getNotes, args: []}
            }).form});
        } else add_cell(row);
    });
    hide_spinner('notes');
};
note_query = () => {
    let sel_notes = document.querySelector('#sel_system'),
        query     = ['_table=' + path[2], '_id=' + path[3]];
    if (sel_notes.value !== '') query.push(sel_notes.value);
    return query;
};