$('#mdl_line_view').on('show.bs.modal', function (event) {
    set_attribute({id: 'btn_request_lines_note_add', attribute: 'data-source', value: 'line_view'});
    set_attribute({id: 'btn_request_lines_note_add', attribute: 'data-_table', value: 'request_lines'});
    set_attribute({id: 'btn_request_lines_note_add', attribute: 'data-_id',    value: event.relatedTarget.dataset.line_id});
    getLineNotes({
        line_id: 'request_lines',
        table: 	 'request_lines',
        id:		 event.relatedTarget.dataset.line_id
    });
});