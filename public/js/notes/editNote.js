function getNoteEdit(note_id) {
    get(
        function (note, options) {
            set_innerText({id: 'note_id_edit', text: note.note_id});
            set_innerText({id: '_note_edit',   text: note._note});
            document.querySelectorAll('.note_id').forEach(e => e.setAttribute('value', note.note_id));
            $('#mdl_note_view').modal('hide')
        },
        {
            db:      path[1],
            table:   'note',
            query:   [`note_id=${note_id}`],
            spinner: 'note_edit',
            onFail: function () {$('#mdl_note_edit').modal('hide')}
        }
    )
};
window.addEventListener('load', function() {
    addFormListener(
        'note_edit',
        'PUT',
        `/${path[1]}/notes`,
        {
            onComplete: [
                getNotes,
                function () {$('#mdl_note_edit').modal('hide')}
            ]
        }
    );
});