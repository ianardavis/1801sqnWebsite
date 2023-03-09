function getNotes() {
    clear('tbl_notes')
    .then(tbl_notes => {
        let where = {
                _table: path[1],
                id:     path[2]
            },
            system = getSelectedOptions('sel_system');
        if (system.length > 0) where.system = system;
        get({
            table: 'notes',
            where: where,
            func: getNotes
        })
        .then(function ([result, options]) {
            set_count('note', result.count);
            result.notes.forEach(note => {
                let row = tbl_notes.insertRow(-1);
                add_cell(row, table_date(note.createdAt));
                add_cell(row, {text: note.note});
                add_cell(row, {append: new Modal_Button(
                    _search(),
                    'note_view',
                    [{field: 'id', value: note.note_id}]
                ).e});
            });
        });
    })
    .catch(err => console.log(err));
};
function viewNote(note_id) {
    get({
        table:   'note',
        where:   {note_id: note_id},
        spinner: 'note_view'
    })
    .then(function ([note, options]) {
        set_innerText('note_id_view',   note.note_id);
        set_innerText('note_createdAt', print_date(note.createdAt, true));
        set_innerText('note_user',      note.user.full_name);
        set_innerText('note_system',    yesno(note.system));
        set_innerText('note_note',      note.note);
        set_href('note_user_link', `/users/${note.user_id}`);
    });
};
window.addEventListener('load', function () {
    add_listener('reload', getNotes);
    modalOnShow('note_view', function(event) {
        if (event.relatedTarget.dataset.id) {
            viewNote(event.relatedTarget.dataset.id)
        } else modalHide('note_view');
    });
    add_listener('sel_system', getNotes, 'input');
    add_sort_listeners('notes', getNotes);
    getNotes();
});