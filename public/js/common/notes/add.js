window.addEventListener('load', function () {
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
});