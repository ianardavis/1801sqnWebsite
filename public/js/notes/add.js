function noteAddReset() {
    set_innerText({id: '_note_add', text: ''});
    set_attribute({id: '_table', attribute: 'value', value: path[1]});
    set_attribute({id: '_id',    attribute: 'value', value: path[2]});
};
window.addEventListener('load', function() {
    enable_button('note_add');
    $('#mdl_note_add').on('show.bs.modal', noteAddReset);
    addFormListener(
        'note_add',
        'POST',
        '/notes',
        {
            onComplete: [
                getNotes,
                function () {$('#mdl_note_add').modal('hide')}
            ]
        }
    );
});