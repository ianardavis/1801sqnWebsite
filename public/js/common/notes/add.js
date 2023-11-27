window.addEventListener('load', function () {
    enableButton('note_add');
    addFormListener(
        'note_add',
        'POST',
        '/notes',
        {
            onComplete: [
                getNotes,
                function () {setValue('note_add_note')}
            ]
        }
    );
    setValue('note_add_table', path[1]);
    setValue('note_add_id',    path[2]);
});