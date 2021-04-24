window.addEventListener('load', function () {
    enable_button('file_add');
    addFormListener(
        'file_detail_add',
        'POST',
        '/file_details',
        {
            onComplete: function () {
                let file_id = document.querySelector('#file_id_view');
                if (file_id) viewDetails(file_id.innerText);
                set_value({id: 'file_detail_name_add',  value: ''});
                set_value({id: 'file_detail_value_add', value: ''});
            }
        }
    );
    $('#mdl_file_view').on('show.bs.modal', function (event) {
        set_attribute({id: 'file_id_detail_add', attribute: 'value', value: event.relatedTarget.dataset.id});
    });
});