$('#mdl_line_view').on('show.bs.modal', function (event) {
    get(
        function (line, options) {
            if (line._status === 1){
                let span_view_buttons = document.querySelector('#span_view_buttons');
                if (span_view_buttons) {
                    span_view_buttons.appendChild(
                        new Delete_Button({
                            float:   true,
                            path:    `/stores/request_lines/${event.relatedTarget.dataset.line_id}`,
                            options: {onComplete: [
                                getLines,
                                function () {$('#mdl_line_view').modal('hide')}
                            ]}
                        }).e
                    )
                };
            };
        },
        {
            table: 'request_line',
            query: [`line_id=${event.relatedTarget.dataset.line_id}`]
        }
    );
});