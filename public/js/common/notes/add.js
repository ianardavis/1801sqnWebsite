window.addEventListener('load', function () {
    enableButton('note_add');
    addFormListener(
        'note_add',
        'POST',
        '/notes',
        {
            onComplete: [
                getNotes,
                function () {set_value('note_add_note')}
            ]
        }
    );
    set_value('note_add_table', path[1]);
    set_value('note_add_id',    path[2]);
});