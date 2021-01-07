$('#mdl_line_view').on('show.bs.modal', function (event) {
    let span_view_buttons = document.querySelector('#span_view_buttons');
    if (span_view_buttons) {
        span_view_buttons.appendChild(
            new Delete_Button({
                float: true,
                path: `/stores/issue_lines/${event.relatedTarget.dataset.line_id}`,
                options: {onComplete: [
                    getLines,
                    function () {$('#mdl_line_view').modal('hide')}
                ]}
            }).e
        )
    };
});