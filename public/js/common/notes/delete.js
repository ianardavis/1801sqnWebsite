function setNoteDeleteBtn(event) {
        get({
            table: 'note',
            where: {note_id: event.relatedTarget.dataset.id}
        })
        .then(function ([note, options]) {
            if (!note.system) {
                setAttribute('note_id_delete', 'value', note.note_id);
                enableButton('note_delete');

            } else {
                removeAttribute('note_id_delete', 'value');
                disableButton('note_delete');
            };
        });
};
window.addEventListener('load', function () {
    addFormListener(
        'note_delete',
        'DELETE',
        '/notes',
        {
            onComplete: [
                getNotes,
                function () {modalHide('note_view')}
            ]
        }
    );
    modalOnShow('note_view', setNoteDeleteBtn);
});