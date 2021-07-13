function getFileDetailNames() {
    clear('file_detail_names')
    .then(list => {
        get({
            table: 'settings',
            query: ['name=file_detail']
        })
        .then(function ([detail_names, options]) {
            detail_names.forEach(detail => {
                list.appendChild(new Option({value: detail.value}).e);
            });
        });
    });
};
window.addEventListener('load', function () {
    enable_button('file_add');
    addFormListener(
        'file_detail_add',
        'POST',
        '/file_details',
        {
            onComplete: function () {
                let file_id = document.querySelector('#file_id');
                if (file_id) viewDetails(file_id.innerText);
                set_value({id: 'file_detail_name_add',  value: ''});
                set_value({id: 'file_detail_value_add', value: ''});
            }
        }
    );
    modalOnShow('file_view', function (event) {
        getFileDetailNames();
        set_attribute({id: 'file_id_detail_add', attribute: 'value', value: event.relatedTarget.dataset.id});
    });
});