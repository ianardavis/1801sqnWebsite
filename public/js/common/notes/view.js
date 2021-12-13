function getNotes() {
    clear('tbl_notes')
    .then(tbl_notes => {
        let sel_system = document.querySelector('#sel_system')       || {value: ''},
            query      = [
                `"_table":"${path[1]}"`,
                `"id":"${path[2]}"`
            ];
        if (sel_system.value !== '') query.push(sel_system.value);
        get({
            table: 'notes',
            query: query,
            ...sort_query(tbl_notes)
        })
        .then(function ([notes, options]) {
            set_count('note', notes.length || '0');
            notes.forEach(note => {
                let row = tbl_notes.insertRow(-1);
                add_cell(row, table_date(note.createdAt));
                add_cell(row, {text: note.note, ellipsis: true});
                add_cell(row, {append: new Button({
                    modal: 'note_view',
                    data: [{field: 'id', value: note.note_id}],
                    small: true
                }).e});
            });
        });
    })
    .catch(err => console.log(err));
};
function viewNote(note_id) {
    get({
        table:   'note',
        query:   [`"note_id":"${note_id}"`],
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
addReloadListener(getNotes);
window.addEventListener('load', function () {
    modalOnShow('note_view', function(event) {
        if (event.relatedTarget.dataset.id) {
            viewNote(event.relatedTarget.dataset.id)
        } else modalHide('note_view');
    });
    addListener('sel_system', getNotes, 'change');
});