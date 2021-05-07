function viewNoteEdit(note_id) {
    get({
        table:   'note',
        query:   [`note_id=${note_id}`],
        spinner: 'note_edit'
    })
    .then(function ([note, options]) {
        set_attribute({id: 'note_id_edit', attribute: 'value', value: note.note_id});
        set_innerText({id: 'note_edit',    text: note.note});
        modalHide('note_view');
    })
    .catch(err => {
        modalHide('note_edit');
    });
};
function addNoteEditBtn(note_id) {
    let note_edit_btn = document.querySelector('#note_edit_btn');
    if (note_edit_btn) {
        note_edit_btn.innerHTML = '';
        get({
            table: 'note',
            query: [`note_id=${note_id}`]
        })
        .then(function ([note, options]) {
            if (!note.system) {
                note_edit_btn.appendChild(new Button({
                    classes: ['float-end'],
                    modal:   'note_edit',
                    data:    {field: 'id', value: note.note_id},
                    type:    'edit',
                }).e);
            };
        });
    };
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
    modalOnShow('note_edit', function(event) {
        viewNoteEdit(event.relatedTarget.dataset.id);
        modalHide('note_view');
    });
});