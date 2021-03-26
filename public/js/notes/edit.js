function getNoteEdit(note_id) {
    get(
        {
            table:   'note',
            query:   [`note_id=${note_id}`],
            spinner: 'note_edit',
            onFail: function () {$('#mdl_note_edit').modal('hide')}
        },
        function (note, options) {
            set_innerText({id: 'note_id_edit', text: note.note_id});
            set_innerText({id: '_note_edit',   text: note.note});
            document.querySelectorAll('.note_id').forEach(e => e.setAttribute('value', note.note_id));
            $('#mdl_note_view').modal('hide')
        }
    )
};
function addNoteEditBtn(note_id) {
    let note_edit_btn = document.querySelector('#note_edit_btn');
    if (note_edit_btn) {
        note_edit_btn.innerHTML = '';
        get(
            {
                table: 'note',
                query: [`note_id=${note_id}`]
            },
            function (note, options) {
                if (!note.system) {
                    note_edit_btn.appendChild(new Button({
                        classes: ['float-right'],
                        modal:   'note_edit',
                        data:    {field: 'id', value: note.note_id},
                        type:    'edit',
                    }).e);
                };
            }
        );
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
                function () {$('#mdl_note_edit').modal('hide')}
            ]
        }
    );
    $('#mdl_note_view').on('show.bs.modal', function(event) {addNoteEditBtn( event.relatedTarget.dataset.id)});
    $('#mdl_note_edit').on('show.bs.modal', function(event) {
        getNoteEdit(event.relatedTarget.dataset.id)
        $(`#mdl_note_view`).modal('hide')});
});