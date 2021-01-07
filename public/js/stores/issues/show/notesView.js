set_attribute({id: 'btn_issue_lines_note_add', attribute: 'data-source', value: 'line_view'});
$('#mdl_line_view').on('show.bs.modal', function (event) {
    set_attribute({id: 'btn_issue_lines_note_add', attribute: 'data-_table', value: 'issue_lines'});
    set_attribute({id: 'btn_issue_lines_note_add', attribute: 'data-_id',    value: event.relatedTarget.dataset.line_id});
    getLineNotes({
        line_id: 'issue_lines',
        table: 	 'issue_lines',
        id:		 event.relatedTarget.dataset.line_id
    });
});