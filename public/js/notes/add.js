function noteAddReset() {
    set_innerText({id: 'note_add', text: ''});
    set_attribute({id: '_table', attribute: 'value', value: path[1]});
    set_attribute({id: 'id',     attribute: 'value', value: path[2]});
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