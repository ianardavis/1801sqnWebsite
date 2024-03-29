function getNotes() {
    Promise.all([
        clear('tbl_notes'),
        getSelectedOptions('sel_notes_system')
    ])
    .then(([tbl_notes, system_notes]) => {
        let where = {
                _table: path[1],
                id:     path[2]
            };
        if (system_notes.length > 0) where['system'] = system_notes;
        get({
            table: 'notes',
            where: where,
            func: getNotes
        })
        .then(function ([result, options]) {
            setCount('note', result.count);
            result.notes.forEach(note => {
                let row = tbl_notes.insertRow(-1);
                addCell(row, tableDate(note.createdAt));
                addCell(row, {text: note.note});
                addCell(row, {append: new Modal_Button(
                    _search(),
                    'note_view',
                    [{field: 'id', value: note.note_id}]
                ).e});
            });
        });
    })
    .catch(err => console.error(err));
};
function viewNote(note_id) {
    get({
        table:   'note',
        where:   {note_id: note_id},
        spinner: 'note_view'
    })
    .then(function ([note, options]) {
        setInnerText('note_id_view',   note.note_id);
        setInnerText('note_createdAt', printDate(note.createdAt, true));
        setInnerText('note_user',      note.user.full_name);
        setInnerText('note_system',    yesno(note.system));
        setInnerText('note_note',      note.note);
        setHREF('note_user_link', `/users/${note.user_id}`);
    });
};
window.addEventListener('load', function () {
    addListener('reload', getNotes);
    modalOnShow('note_view', function(event) {
        if (event.relatedTarget.dataset.id) {
            viewNote(event.relatedTarget.dataset.id)
        } else modalHide('note_view');
    });
    addListener('sel_notes_system', getNotes, 'input');
    addSortListeners('notes', getNotes);
    getNotes();
});