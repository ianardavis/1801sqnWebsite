$('#mdl_nsn_view').on('show.bs.modal', function(event) {
    get(
        function(nsn, options) {
            let span_nsn_delete = document.querySelector('#span_nsn_delete');
            if (span_nsn_delete) {
                span_nsn_delete.innerHTML = '';
                span_nsn_delete.appendChild(
                    new Delete_Button({
                        descriptor: 'NSN',
                        path:       `/stores/nsns/${nsn.nsn_id}`,
                        options: {
                            onComplete: [
                                getNSNs,
                                function () {$('#mdl_nsn_view').modal('hide')}
                            ]
                        }
                    }).e
                );
            };
        },
        {
            table: 'nsn',
            query: [`nsn_id=${event.relatedTarget.dataset.nsn_id}`],
            spinner: 'nsn_view'
        }
    );
});