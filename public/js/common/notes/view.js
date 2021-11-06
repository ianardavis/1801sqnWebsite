function getNotes() {
    clear('tbl_notes')
    .then(tbl_notes => {
        let sel_system = document.querySelector('#sel_system') || {value: ''},
            sort_cols  = tbl_notes.parentNode.querySelector('.sort') || null;
        get({
            table: 'notes',
            query: [
                `_table=${path[1]}`,
                `id=${path[2]}`,
                sel_system.value
            ],
            sort:  (sort_cols ? {col: sort_cols.dataset.sort_col, dir: sort_cols.dataset.sort_dir} : null)
        })
        .then(function ([notes, options]) {
            set_count({id: 'note', count: notes.length || '0'});
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
        query:   [`note_id=${note_id}`],
        spinner: 'note_view'
    })
    .then(function ([note, options]) {
        set_innerText({id: 'note_id_view',   text: note.note_id});
        set_innerText({id: 'note_createdAt', text: print_date(note.createdAt, true)});
        set_innerText({id: 'note_user',      text: note.user.full_name});
        set_href(     {id: 'note_user_link', value: `/users/${note.user_id}`});
        set_innerText({id: 'note_system',    text: yesno(note.system)});
        set_innerText({id: 'note_note',      text: note.note});
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