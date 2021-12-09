function noteAddReset() {
    set_innerText('note_add');
    set_attribute('_table', 'value', path[1]);
    set_attribute('id',     'value', path[2]);
};
window.addEventListener('load', function() {
    enable_button('note_add');
    modalOnShow('note_add', noteAddReset);
    addFormListener(
        'note_add',
        'POST',
        '/notes',
        {
            onComplete: [
                getNotes,
                function () {modalHide('note_add')}
            ]
        }
    );
});