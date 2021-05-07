function addNoteDeleteBtn(note_id) {
    let note_delete_btn = document.querySelector('#note_delete_btn');
    if (note_delete_btn) {
        note_delete_btn.innerHTML = '';
        get({
            table: 'note',
            query: [`note_id=${note_id}`]
        })
        .then(function ([note, options]) {
            if (!note.system) {
                note_delete_btn.appendChild(
                    new Delete_Button({
                        path: `/notes/${note.note_id}`,
                        descriptor: 'note',
                        options: {
                            onComplete: [
                                getNotes,
                                function () {modalHide('note_view')}
                            ]
                        }
                    }).e
                );
            };
        });
    };
};
window.addEventListener('load', function () {
    modalOnShow('note_view', function(event) {addNoteDeleteBtn(event.relatedTarget.dataset.id)});
});