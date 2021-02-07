window.addEventListener('load', function () {
    remove_attribute({id: 'btn_file_add', attribute: 'disabled'});
    addFormListener(
        'file_detail_add',
        'POST',
        '/stores/file_details',
        {
            onComplete: function () {
                let file_id = document.querySelector('#file_id_view');
                if (file_id) viewDetails(file_id.innerText);
                set_value({id: '_name_file_detail_add',  value: ''});
                set_value({id: '_value_file_detail_add', value: ''});
            }
        }
    );
    $('#mdl_file_view').on('show.bs.modal', function (event) {
        set_attribute({id: 'file_id_detail_add', attribute: 'value', value: event.relatedTarget.dataset.id});
    });
});