window.addEventListener('load', function() {
    set_attribute({id: 'btn_note_add', attribute: 'data-_table', value: path[2]});
    set_attribute({id: 'btn_note_add', attribute: 'data-_id',    value: path[3]});
    let onComplete = []; 
    addFormListener(
        'form_note_add',
        'POST',
        `/${path[1]}/notes`,
        {
            onComplete: [
                getNotes,
                function () {
                    set_innerText({id: '_note', text: ''});
                    $('#mdl_note_add').modal('hide');
                }
            ]
        }
    );
    $('#mdl_note_add').on('show.bs.modal', function(event) {
        if (event.relatedTarget.dataset.source) $(`#mdl_${event.relatedTarget.dataset.source.toLowerCase()}_view`).modal('hide');
        set_attribute({id: '_table', attribute: 'value', value: event.relatedTarget.dataset._table});
        set_attribute({id: '_id',    attribute: 'value', value: event.relatedTarget.dataset._id});
    });
});