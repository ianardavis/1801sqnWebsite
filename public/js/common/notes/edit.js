function viewNoteEdit(note_id) {
    get({
        table:   'note',
        where:   {note_id: note_id},
        spinner: 'note_edit'
    })
    .then(function ([note, options]) {
        set_attribute('note_id_edit', 'value', note.note_id);
        set_innerText('note_edit', note.note);
    })
    .catch(err => {
        modalHide('note_edit');
    });
};
function addNoteEditBtn(note_id) {
    clear('note_edit_btn')
    .then(note_edit_btn => {
        get({
            table: 'note',
            where: {note_id: note_id}
        })
        .then(function ([note, options]) {
            if (!note.system) {
                note_edit_btn.appendChild(new Modal_Button(
                    _edit(),
                    'note_edit',[
                        {field: 'id',         value: note.note_id},
                        {field: 'bs-dismiss', value: 'modal'}
                    ],
                    false,
                    {classes: ['float-end']},
                ).e);
            };
        });
    });
};
window.addEventListener('load', function() {
    addFormListener(
        'note_edit',
        'PUT',
        `/notes`,
        {
            onComplete: [
                getNotes,
                function () {modalHide('note_edit')}
            ]
        }
    );
    modalOnShow('note_view', function(event) {addNoteEditBtn(event.relatedTarget.dataset.id)});
    modalOnShow('note_edit', function(event) {viewNoteEdit(event.relatedTarget.dataset.id);});
});